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

    // 展開機能のイベントリスナーを削除

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

            // 展開機能をなくし、内容を常に表示
            listItem.innerHTML = `
                <div class="note-actions">
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                    <button class="copy-btn">コピー</button>
                </div>
                <p>${note.content}</p>
            `;
            noteList.appendChild(listItem);
        });
    }

    function saveNotes() {
        localStorage.setItem('recodes', JSON.stringify(recodes));
    }
});
