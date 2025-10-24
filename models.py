import sqlite3

DB_NAME = 'database.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def get_items():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT nombre, precio FROM items')
    items = [{'nombre': row[0], 'precio': row[1]} for row in cursor.fetchall()]
    conn.close()
    return items

def add_item(nombre, precio):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO items (nombre, precio) VALUES (?, ?)', (nombre, precio))
    conn.commit()
    conn.close()

def delete_item(nombre):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM items WHERE nombre = ?', (nombre,))
    conn.commit()
    conn.close()

def update_item(nombre_original, nuevo_nombre, nuevo_precio):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE items SET nombre = ?, precio = ?
        WHERE nombre = ?
    ''', (nuevo_nombre, nuevo_precio, nombre_original))
    conn.commit()
    conn.close()
