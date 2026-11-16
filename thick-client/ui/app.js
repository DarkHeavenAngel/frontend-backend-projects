const { createApp } = Vue;

createApp({
    data() {
        return {
            books: [],
            newBook: { author: '', title: '', genre: '', year: '' },
            
            editingId: null,
            editData: { author: '', title: '', genre: '', year: '' },
            
            searchId: '',
            searchAuthor: '',
            authorStats: null,
            
            isAdmin: false,
            loginData: { username: '', password: '' },
            authError: ''
        }
    },
    methods: {
        async checkAuth() {
            try {
                const response = await fetch('/api/auth/status');
                if (response.ok) {
                    const data = await response.json();
                    this.isAdmin = data.isAdmin;
                }
            } catch (error) {
                console.error("Помилка перевірки статусу:", error);
            }
        },

        async login() {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.loginData)
                });
                
                if (response.ok) {
                    this.isAdmin = true;
                    this.loginData = { username: '', password: '' };
                    this.authError = '';
                } else {
                    this.authError = 'Невірний логін або пароль';
                }
            } catch (error) {
                console.error("Помилка входу:", error);
            }
        },

        async logout() {
            try {
                await fetch('/api/logout', { method: 'POST' });
                this.isAdmin = false;
                this.cancelEdit();
            } catch (error) {
                console.error("Помилка виходу:", error);
            }
        },

        async fetchAllBooks() {
            try {
                const response = await fetch('/api/books');
                this.books = await response.json();
                this.searchId = ''; 
            } catch (error) {
                console.error("Помилка завантаження книг:", error);
            }
        },

        async fetchBookById() {
            if (!this.searchId.trim()) {
                this.fetchAllBooks();
                return; 
            }
            
            try {
                const response = await fetch(`/api/books/${this.searchId}`);
                
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const book = await response.json();
                    this.books = book ? [book] : []; 
                } else {
                    this.books = []; 
                }
            } catch (error) {
                console.error("Помилка пошуку за ID:", error);
                this.books = [];
            }
        },

        async fetchAuthorStats() {
            if (!this.searchAuthor.trim()) {
                this.authorStats = null;
                return;
            }
            
            try {
                const response = await fetch(`/api/books/authorStats/${this.searchAuthor}`);
                if (response.ok) {
                    this.authorStats = await response.json();
                } else {
                    this.authorStats = null;
                }
            } catch (error) {
                console.error("Помилка отримання статистики:", error);
                this.authorStats = null;
            }
        },
        
        async addBook() {
            if (!this.isAdmin) return;
            try {
                await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newBook)
                });
                this.newBook = { author: '', title: '', genre: '', year: '' };
                this.fetchAllBooks(); 
            } catch (error) {
                console.error("Помилка додавання:", error);
            }
        },

        startEdit(book) {
            this.editingId = book._id;
            this.editData = { author: book.author, title: book.title, genre: book.genre, year: book.year };
        },
        
        cancelEdit() {
            this.editingId = null;
        },

        async saveEdit() {
            if (!this.isAdmin) return;
            try {
                await fetch(`/api/books/${this.editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.editData)
                });
                this.cancelEdit();
                
                if (this.searchId) {
                    this.fetchBookById();
                } else {
                    this.fetchAllBooks();
                }
            } catch (error) {
                console.error("Помилка оновлення:", error);
            }
        },

        async deleteBook(id) {
            if (!this.isAdmin) return;
            try {
                await fetch(`/api/books/${id}`, { method: 'DELETE' });
                this.fetchAllBooks();
            } catch (error) {
                console.error("Помилка видалення:", error);
            }
        }
    },
    mounted() {
        this.checkAuth();
        this.fetchAllBooks();
    }
}).mount('#app');
