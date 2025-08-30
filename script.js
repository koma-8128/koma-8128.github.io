document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('noteForm');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const noteList = document.getElementById('noteList');
    const searchInput = document.getElementById('searchInput');

    // ローカルストレージからメモを読み込む
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // ページ読み込み時にメモ一覧をレンダリング
    renderNotes(notes);

    // メモ追加フォームの送信イベントを処理
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault(); // フォームのデフォルト送信を防止

        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (title && content) {
            const newNote = {
                title: title,
                content: content
            };

            notes.push(newNote);
            saveNotes(); // メモを保存
            renderNotes(notes); // メモ一覧を更新

            // フォームをリセット
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }
    });

    // 検索ボックスの入力イベントを処理
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // 検索キーワードを引数として渡す
        renderNotes(notes, searchTerm); 
    });

    // メモの表示・非表示を切り替えるイベントリスナー
    noteList.addEventListener('click', (e) => {
        const header = e.target.closest('.note-header');
        if (header) {
            const contentDiv = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // 他の開いているメモを閉じる
            noteList.querySelectorAll('.note-header[aria-expanded="true"]').forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.style.display = 'none';
                }
            });

            // クリックしたメモの表示を切り替える
            if (isExpanded) {
                header.setAttribute('aria-expanded', 'false');
                contentDiv.style.display = 'none';
            } else {
                header.setAttribute('aria-expanded', 'true');
                contentDiv.style.display = 'block';
            }
        }
    });

    // 編集、削除、コピーの各ボタンのイベントリスナーを定義します
    noteList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        const copyButton = e.target.closest('.copy-btn');
        
        // closest() で親要素の `.note-item` を取得し、データ属性からインデックスを取得
        const noteItem = e.target.closest('.note-item');
        if (!noteItem) return;
        
        // 元の配列のインデックスを取得
        const index = noteItem.dataset.originalIndex;
        
        // 編集ボタンの処理
        if (editButton) {
            const newTitle = prompt('新しい題名を入力してください:', notes[index].title);
            const newContent = prompt('新しい本文を入力してください:', notes[index].content);
            
            if (newTitle !== null && newContent !== null) {
                notes[index].title = newTitle;
                notes[index].content = newContent;
                saveNotes();
                renderNotes(notes, searchInput.value.toLowerCase()); // 修正後も検索結果を維持
            }
        }
        
        // 削除ボタンの処理
        if (deleteButton) {
            if (confirm('この参戦実況を削除しますか？')) {
                notes.splice(index, 1);
                saveNotes();
                renderNotes(notes, searchInput.value.toLowerCase()); // 修正後も検索結果を維持
            }
        }
        
        // コピーボタンの処理
        if (copyButton) {
            navigator.clipboard.writeText(notes[index].content)
                .then(() => {
                    alert('メ参戦実況の内容がクリップボードにコピーされました！');
                })
                .catch(err => {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーに失敗しました。');
                });
        }
    });

    // メモ一覧をHTMLにレンダリングする関数
    function renderNotes(noteArray, searchTerm = '') {
        noteList.innerHTML = ''; // 一旦リストをクリア
        noteArray.forEach((note, index) => {
            // 検索語句が含まれていない場合はスキップ
            if (searchTerm && !note.title.toLowerCase().includes(searchTerm)) {
                return;
            }

            const listItem = document.createElement('li');
            listItem.className = 'note-item';
            // 元の配列のインデックスをデータ属性として保存
            listItem.dataset.originalIndex = index; 

            listItem.innerHTML = `
                <div class="note-header" aria-expanded="false">
                    <span>${note.title}</span>
                    <span class="arrow">▶</span>
                </div>
                <div class="note-content">
                    <div class="note-actions">
                        <button class="edit-btn">編集</button>
                        <button class="delete-btn">削除</button>
                        <button class="copy-btn">コピー</button>
                    </div>
                    <p>${note.content}</p>
                </div>
            `;
            noteList.appendChild(listItem);
        });
    }

    // メモをローカルストレージに保存する関数
    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
});
