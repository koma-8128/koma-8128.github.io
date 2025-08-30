document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('noteForm');
    const noteContentInput = document.getElementById('noteContent');
    const noteList = document.getElementById('noteList');
    const searchInput = document.getElementById('searchInput');

    let recodes = JSON.parse(localStorage.getItem('recodes')) || [];

    renderNotes(recodes);

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const content = noteContentInput.value.trim();

        if (content) {
            const newNote = {
                title: '',
                content: content
            };

            recodes.push(newNote);
            saveNotes();
            renderNotes(recodes);

            noteContentInput.value = '';
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredNotes = recodes.filter(note => 
            note.content.toLowerCase().includes(searchTerm)
        );
        renderNotes(filteredNotes); 
    });

    // メモの表示・非表示を切り替えるイベントリスナーはそのまま
    noteList.addEventListener('click', (e) => {
        const header = e.target.closest('.note-header');
        if (header) {
            const contentDiv = header.nextElementSibling.nextElementSibling; // 次の要素をスキップして.note-contentを取得
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            noteList.querySelectorAll('.note-header[aria-expanded="true"]').forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    // 他のメモの内容を閉じる
                    otherHeader.nextElementSibling.nextElementSibling.style.display = 'none'; 
                }
            });

            if (isExpanded) {
                header.setAttribute('aria-expanded', 'false');
                contentDiv.style.display = 'none';
            } else {
                header.setAttribute('aria-expanded', 'true');
                contentDiv.style.display = 'block';
            }
        }
    });

    noteList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        const copyButton = e.target.closest('.copy-btn');
        
        const noteItem = e.target.closest('.note-item');
        if (!noteItem) return;
        
        const index = noteItem.dataset.index;
        
        if (editButton) {
            const newContent = prompt('新しいレコードを入力してください:', recodes[index].content);
            
            if (newContent !== null) {
                recodes[index].content = newContent;
                saveNotes();
                renderNotes(recodes);
            }
        }
        
        if (deleteButton) {
            if (confirm('このレコードを削除しますか？')) {
                recodes.splice(index, 1);
                saveNotes();
                renderNotes(recodes);
            }
        }
        
        if (copyButton) {
            navigator.clipboard.writeText(recodes[index].content)
                .then(() => {
                    alert('レコードの内容がクリップボードにコピーされました！');
                })
                .catch(err => {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーに失敗しました。');
                });
        }
    });

    // メモ一覧をHTMLにレンダリングする関数
    function renderNotes(noteArray) {
        noteList.innerHTML = '';
        noteArray.forEach((note, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'note-item';
            listItem.dataset.index = index; 

            // ★ 修正点: ボタンの要素を.note-contentの外に配置します ★
            listItem.innerHTML = `
                <div class="note-header" aria-expanded="false">
                    <span>${note.content.substring(0, 30)}...</span>
                    <span class="arrow">▶</span>
                </div>
                <div class="note-actions">
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                    <button class="copy-btn">コピー</button>
                </div>
                <div class="note-content">
                    <p>${note.content}</p>
                </div>
            `;
            noteList.appendChild(listItem);
        });
    }

    function saveNotes() {
        localStorage.setItem('recodes', JSON.stringify(recodes));
    }
});