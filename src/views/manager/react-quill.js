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

    // react-quill이 dynamic(ssr:false) 로딩이라 마운트 직후엔 toolbar DOM이 아직 없을 수 있어
    // 짧게 폴링하다 toolbar container가 준비되면 한 번만 title/aria-label을 주입한다.
    useEffect(() => {
        let tries = 0;
        const timer = setInterval(() => {
            tries += 1;
            const container = quillRef.current?.getEditor?.()?.getModule?.('toolbar')?.container;
            if (container) {
                // 일반 버튼(bold/align/list/indent/header/link/image/video/clean 등)
                container.querySelectorAll('button[class*="ql-"]').forEach((btn) => {
                    const cls = Array.from(btn.classList).find((c) => c.startsWith('ql-'));
                    if (!cls) return;
                    const suffix = btn.hasAttribute('value') ? `[${btn.getAttribute('value')}]` : '';
                    const label = QUILL_TOOLTIPS[cls + suffix] || QUILL_TOOLTIPS[cls];
                    if (label) {
                        btn.setAttribute('title', label);
                        btn.setAttribute('aria-label', label);
                    }
                });
                // 드롭다운(글꼴/글자 크기/글자 색)은 span.ql-picker 형태
                container.querySelectorAll('span.ql-picker').forEach((picker) => {
                    const cls = Array.from(picker.classList).find(
                        (c) => c.startsWith('ql-') && c !== 'ql-picker' && !c.endsWith('-picker')
                    );
                    const label = cls && QUILL_TOOLTIPS[cls];
                    if (!label) return;
                    const target = picker.querySelector('.ql-picker-label') || picker;
                    target.setAttribute('title', label);
                    target.setAttribute('aria-label', label);
                });
                clearInterval(timer);
            } else if (tries > 40) {
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
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