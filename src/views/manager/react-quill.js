import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";
import { useRef } from "react";
import { uploadFileByManager } from "src/utils/api";
import { base64toFile } from "src/utils/function";
import toast from "react-hot-toast";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

// 툴바 버튼에 한글 설명(hover 툴팁). Quill이 자동 생성한 버튼엔 title/aria-label이 없어
// 마우스를 올려도 용도를 알 수 없으므로, 마운트 후 DOM에 직접 title을 주입한다.
// key: 'ql-<클래스>' 또는 value가 있는 버튼은 'ql-<클래스>[<value>]'
const QUILL_TOOLTIPS = {
    'ql-header[1]': '제목 1',
    'ql-header[2]': '제목 2',
    'ql-font': '글꼴',
    'ql-size': '글자 크기',
    'ql-color': '글자 색',
    'ql-bold': '굵게',
    'ql-italic': '기울임',
    'ql-underline': '밑줄',
    'ql-strike': '취소선',
    'ql-blockquote': '인용구',
    'ql-list[ordered]': '번호 목록',
    'ql-list[bullet]': '글머리 기호',
    'ql-indent[-1]': '내어쓰기',
    'ql-indent[+1]': '들여쓰기',
    'ql-link': '링크',
    'ql-image': '이미지',
    'ql-video': '동영상',
    'ql-align[]': '왼쪽 맞춤',
    'ql-align[center]': '가운데 맞춤',
    'ql-align[right]': '오른쪽 맞춤',
    'ql-align[justify]': '양쪽 맞춤',
    'ql-clean': '서식 지우기',
};

const ReactQuillComponent = (props) => {

    const {
        value,
        setValue
    } = props;

    const quillRef = useRef(null);
    // 업로드가 끝났을 때 '그 시점의 최신 내용' 에 주소를 반영하려고 둔다(아래 onChange 설명).
    const latestRef = useRef(value);
    const setValueRef = useRef(setValue);
    setValueRef.current = setValue;
    const 올리는중 = useRef(new Map()); // base64 → 업로드 Promise (같은 그림을 두 번 올리지 않게)

    // 툴바 버튼에 한글 설명(title) 주입.
    //
    // ⚠ quillRef 로는 안 된다. next/dynamic(Next 13)은 ref 를 전달하지 않아
    //   quillRef.current 가 항상 null 이다(= getEditor() 호출 불가). 그래서 ref 대신
    //   Quill 이 실제로 만들어 둔 .ql-toolbar DOM 을 직접 찾아 title 을 단다.
    //
    // 에디터는 탭/아코디언 안에서 뒤늦게 마운트되거나 다시 마운트될 수 있으므로
    // MutationObserver 로 계속 지켜보되, 이미 처리한 툴바는 data 속성으로 건너뛴다.
    useEffect(() => {
        const applyTitle = (el, key) => {
            const label = QUILL_TOOLTIPS[key];
            if (!label) return;
            el.setAttribute('title', label);
            el.setAttribute('aria-label', label);
        };

        const decorate = () => {
            // 아직 처리 안 된 툴바만 고른다(처리 후엔 매칭 0건이라 즉시 끝난다).
            document.querySelectorAll('.ql-toolbar:not([data-kr-tooltip="1"])').forEach((toolbar) => {
                toolbar.dataset.krTooltip = '1';

                // 일반 버튼(굵게/기울임/목록/들여쓰기/링크/이미지/맞춤/서식지우기 등)
                toolbar.querySelectorAll('button[class*="ql-"]').forEach((btn) => {
                    const cls = Array.from(btn.classList).find((c) => c.startsWith('ql-'));
                    if (!cls) return;
                    // 같은 클래스에 value 로 구분되는 버튼(header 1/2, list, indent, align)
                    const suffix = btn.hasAttribute('value') ? `[${btn.getAttribute('value')}]` : '';
                    applyTitle(btn, QUILL_TOOLTIPS[cls + suffix] ? cls + suffix : cls);
                });

                // 드롭다운(글꼴/글자 크기/글자 색)은 button 이 아니라 span.ql-picker
                toolbar.querySelectorAll('span.ql-picker').forEach((picker) => {
                    const cls = Array.from(picker.classList).find(
                        (c) => c.startsWith('ql-') && c !== 'ql-picker' && !c.endsWith('-picker')
                    );
                    if (!cls) return;
                    applyTitle(picker.querySelector('.ql-picker-label') || picker, cls);
                });
            });
        };

        decorate(); // 이미 떠 있으면 즉시 적용

        // 에디터 입력마다 mutation 이 쏟아지므로, 한 프레임에 한 번으로 묶어 처리한다.
        let scheduled = 0;
        const observer = new MutationObserver(() => {
            if (scheduled) return;
            scheduled = requestAnimationFrame(() => {
                scheduled = 0;
                decorate();
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            if (scheduled) cancelAnimationFrame(scheduled);
        };
    }, []);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ size: [] }],
                    [{'color': []}, 'bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [
                        { list: 'ordered' },
                        { list: 'bullet' },
                        { indent: '-1' },
                        { indent: '+1' },
                    ],
                    ['link', 'image', 'video'],
                    [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                    ['clean'],
                ],
                handlers: {
                    // 이미지 버튼 — 여러 장을 한 번에 고르고, 먼저 올린 뒤 주소로 넣는다.
                    // Quill 기본 동작은 한 장만 고를 수 있고, base64 를 편집기에 넣은 뒤 onChange 에서 바꿔치기했다.
                    // 그 방식은 업로드 중에 연달아 넣거나 기존 그림 앞에 넣으면 그림이 사라졌다
                    // (해담수산 「상품설명에 이미지가 하나밖에 안 올라간다」, 2026-10-14 재현).
                    image: function () {
                        const quill = this.quill;
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.onchange = async () => {
                            const files = Array.from(input.files || []);
                            if (!files.length) return;
                            const range = quill.getSelection(true);
                            const 안내 = toast.loading(`이미지 ${files.length}장 올리는 중...`);
                            const 결과 = await Promise.all(files.map((file) => uploadFileByManager({ file }).catch(() => false)));
                            toast.dismiss(안내);
                            let index = range?.index ?? quill.getLength();
                            let 실패 = 0;
                            for (const r of 결과) {
                                if (!r?.url) { 실패++; continue; }
                                quill.insertEmbed(index, 'image', r.url, 'user');
                                index++;
                            }
                            quill.setSelection(index, 0, 'user');
                            if (실패) toast.error(`이미지 ${실패}장을 올리지 못했습니다. 다시 시도해 주세요.`);
                        };
                        input.click();
                    },
                },
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        [],
    );
    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
        'color',
        'align',
    ]
    return (
        <>
            <ReactQuill
                className="max-height-editor"
                theme={'snow'}
                id={'content'}
                placeholder={''}
                value={value}
                modules={modules}
                formats={formats}
                ref={quillRef}
                onChange={(html) => {
                    // 붙여넣기·끌어다 놓기로 들어온 base64 그림을 올려서 주소로 바꾼다.
                    // 예전엔 '<img src="' 로 자르고 '"></p>' 까지를 그림으로 봤다. 그림 뒤에 다른 그림·글자가
                    // 이어지면 잘못 잘려 atob 에서 터졌고, 그 뒤로는 setValue 가 안 불려 상태가 굳었다.
                    // 또 업로드를 기다린 뒤 '그때의 note' 로 setValue 해서, 그 사이 넣은 그림이 덮여 사라졌다.
                    // 지금은 바로 setValue 하고, 업로드가 끝나면 최신 내용(latestRef)에 주소만 바꿔 넣는다.
                    latestRef.current = html;
                    setValue(html);
                    const 그림들 = [...new Set([...html.matchAll(/<img[^>]*?src="(data:image\/[^;"]+;base64,[^"]+)"/g)].map((m) => m[1]))];
                    for (const data of 그림들) {
                        if (올리는중.current.has(data)) continue;
                        const 작업 = uploadFileByManager({ file: base64toFile(data, 'note.png') })
                            .then((r) => r?.url || false)
                            .catch(() => false);
                        올리는중.current.set(data, 작업);
                        작업.then((url) => {
                            올리는중.current.delete(data);
                            const 지금 = latestRef.current ?? '';
                            if (!지금.includes(data)) return; // 그새 지운 그림
                            let 바뀐 = 지금;
                            if (url) {
                                바뀐 = 지금.split(data).join(url);
                            } else {
                                // 못 올린 그림은 빼고 알린다 — base64 째로 저장되면 설명이 수 MB 로 불어난다.
                                const 위치 = 지금.indexOf(data);
                                const 시작 = 지금.lastIndexOf('<img', 위치);
                                const 끝 = 지금.indexOf('>', 위치 + data.length);
                                if (시작 >= 0 && 끝 >= 0) 바뀐 = 지금.slice(0, 시작) + 지금.slice(끝 + 1);
                                toast.error('이미지를 올리지 못해 뺐습니다. 다시 넣어 주세요.');
                            }
                            latestRef.current = 바뀐;
                            setValueRef.current(바뀐);
                        });
                    }
                }} />
        </>
    )
}
export default ReactQuillComponent;