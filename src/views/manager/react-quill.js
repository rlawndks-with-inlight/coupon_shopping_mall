import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";
import { useRef } from "react";
import { uploadFileByManager } from "src/utils/api";
import { base64toFile } from "src/utils/function";
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
                onChange={async (e) => {
                    let note = e;
                    if (e.includes('<img src="') && e.includes('base64,')) {
                        let base64_list = e.split('<img src="');
                        for (var i = 0; i < base64_list.length; i++) {
                            if (base64_list[i].includes('base64,')) {
                                let img_src = base64_list[i];
                                img_src = await img_src.split(`"></p>`);
                                let base64 = img_src[0];
                                img_src = await base64toFile(img_src[0], 'note.png');
                                const response = await uploadFileByManager({
                                    file: img_src
                                });
                                note = await note.replace(base64, response?.url)
                            }
                        }
                    }
                    setValue(note);
                }} />
        </>
    )
}
export default ReactQuillComponent;