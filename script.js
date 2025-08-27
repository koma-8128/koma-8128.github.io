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
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm)
        );
        renderNotes(filteredNotes); // フィルタリングされたメモをレンダリング
    });

    // メモの表示・非表示を切り替えるイベントリスナー
    // ★★★ この部分を修正します ★★★
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

    // ★★ 編集、削除、コピーの各ボタンのイベントリスナーを定義します ★★
    noteList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        const copyButton = e.target.closest('.copy-btn');
        
        // closest() で親要素の `.note-item` を取得し、データ属性からインデックスを取得
        const noteItem = e.target.closest('.note-item');
        if (!noteItem) return;
        
        const index = noteItem.dataset.index;
        
        // 編集ボタンの処理
        if (editButton) {
            const newTitle = prompt('新しい題名を入力してください:', notes[index].title);
            const newContent = prompt('新しい本文を入力してください:', notes[index].content);
            
            if (newTitle !== null && newContent !== null) {
                notes[index].title = newTitle;
                notes[index].content = newContent;
                saveNotes();
                renderNotes(notes);
            }
        }
        
        // 削除ボタンの処理
        if (deleteButton) {
            if (confirm('このメモを削除しますか？')) {
                notes.splice(index, 1);
                saveNotes();
                renderNotes(notes);
            }
        }
        
        // コピーボタンの処理
        if (copyButton) {
            navigator.clipboard.writeText(notes[index].content)
                .then(() => {
                    alert('メモの内容がクリップボードにコピーされました！');
                })
                .catch(err => {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーに失敗しました。');
                });
        }
    });

    // メモ一覧をHTMLにレンダリングする関数
    // ★★★ この部分を修正します ★★★
    function renderNotes(noteArray) {
        noteList.innerHTML = ''; // 一旦リストをクリア
        noteArray.forEach((note, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'note-item';
            // データ属性を使って、メモのインデックスを保存
            listItem.dataset.index = index; 

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



