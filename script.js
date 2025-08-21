document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('noteForm');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const noteList = document.getElementById('noteList');
    const searchInput = document.getElementById('searchInput');

    // ★★★ GASウェブアプリのURLをここに貼り付けます ★★★
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwcJ3U2bG93GsCUix1XBYtzdHyCQMv3FGAuSUf9D_zEGbyXVPoBQrzMTEf2oaMHzAL-/exec';

    // ページ読み込み時にスプレッドシートからメモを読み込む
    loadNotesFromSpreadsheet();

    // メモ追加フォームの送信イベントを処理
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (title && content) {
            const newNote = {
                title: title,
                content: content
            };
            
            // スプレッドシートに保存
            saveToSpreadsheet(newNote);

            // フォームをリセット
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }
    });

    // 検索ボックスの入力イベントを処理
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // ★★★ 検索はローカルの配列に対して行います ★★★
        const filteredNotes = localNotes.filter(note => 
            note.title.toLowerCase().includes(searchTerm)
        );
        renderNotes(filteredNotes);
    });
    
    // ★★★ 編集、削除、コピーの各ボタンのイベントリスナーはそのまま利用 ★★★
    noteList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        const copyButton = e.target.closest('.copy-btn');
        
        const noteItem = e.target.closest('.note-item');
        if (!noteItem) return;
        
        // ローカルの配列のインデックスを使用
        const index = noteItem.dataset.index;
        
        // 編集ボタンの処理
        if (editButton) {
            const newTitle = prompt('新しい名前を入力してください:', localNotes[index].title);
            const newContent = prompt('新しい題名を入力してください:', localNotes[index].content);
            
            if (newTitle !== null && newContent !== null) {
                // スプレッドシートへの更新処理は複雑なため、今回は非対応とします
                // 新しいメモとして追加する処理に代えます
                const updatedNote = {
                    title: newTitle,
                    content: newContent
                };
                saveToSpreadsheet(updatedNote);
            }
        }
        
        // 削除ボタンの処理
        if (deleteButton) {
            if (confirm('このメモを削除しますか？')) {
                // スプレッドシートからの削除は複雑なため、今回は非対応とします
                // ローカルの表示からのみ削除します
                localNotes.splice(index, 1);
                renderNotes(localNotes);
            }
        }
        
        // コピーボタンの処理
        if (copyButton) {
            navigator.clipboard.writeText(`${localNotes[index].title}\n\n${localNotes[index].content}`)
                .then(() => {
                    alert('メモの内容がクリップボードにコピーされました！');
                })
                .catch(err => {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーに失敗しました。');
                });
        }
    });
    
    // スプレッドシートからメモを読み込む関数
    let localNotes = []; // 読み込んだメモを格納する配列
    function loadNotesFromSpreadsheet() {
        fetch(GAS_WEB_APP_URL, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localNotes = data.notes;
                renderNotes(localNotes);
                console.log('スプレッドシートからメモを読み込みました。');
            } else {
                console.error('スプレッドシートからの読み込みに失敗しました:', data.message);
                alert('スプレッドシートからの読み込みに失敗しました。');
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('通信エラーが発生しました。');
        });
    }

    // スプレッドシートにデータを送信する関数
    function saveToSpreadsheet(noteData) {
        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(noteData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('メモがスプレッドシートに保存されました。');
                // 保存が成功したら再読み込み
                loadNotesFromSpreadsheet();
            } else {
                console.error('スプレッドシートへの保存に失敗しました:', data.message);
                alert('スプレッドシートへの保存に失敗しました。');
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('通信エラーが発生しました。');
        });
    }

    // メモ一覧をHTMLにレンダリングする関数
    function renderNotes(noteArray) {
        noteList.innerHTML = '';
        noteArray.forEach((note, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'note-item';
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
});
