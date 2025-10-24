from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from models import init_db, get_items, add_item, delete_item, update_item

app = Flask(__name__)
CORS(app)

init_db()  # Inicializa la base de datos al arrancar

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/items', methods=['GET'])
def items_get():
    return jsonify(get_items())

@app.route('/items', methods=['POST'])
def items_post():
    data = request.get_json()
    nombre = data.get('nombre')
    precio = data.get('precio')
    if nombre and isinstance(precio, (int, float)):
        add_item(nombre, precio)
        return jsonify({'status': 'ok', 'items': get_items()})
    return jsonify({'status': 'error', 'message': 'Datos inválidos'}), 400

@app.route('/items/delete', methods=['POST'])
def items_delete():
    data = request.get_json()
    nombre = data.get('nombre')
    if nombre:
        delete_item(nombre)
        return jsonify({'status': 'ok', 'items': get_items()})
    return jsonify({'status': 'error', 'message': 'Nombre requerido'}), 400

@app.route('/items/update', methods=['POST'])
def items_update():
    data = request.get_json()
    nombre_original = data.get('nombre_original')
    nuevo_nombre = data.get('nuevo_nombre')
    nuevo_precio = data.get('nuevo_precio')
    if nombre_original and nuevo_nombre and isinstance(nuevo_precio, (int, float)):
        update_item(nombre_original, nuevo_nombre, nuevo_precio)
        return jsonify({'status': 'ok', 'items': get_items()})
    return jsonify({'status': 'error', 'message': 'Datos inválidos'}), 400

@app.route('/facturar', methods=['POST'])
def facturar():
    data = request.get_json()
    carrito = data.get('items', [])
    pagado = data.get('pagado', 0)

    total = sum(item['precio'] * item['cantidad'] for item in carrito)
    vuelto = pagado - total

    return jsonify({
        'total': total,
        'vuelto': vuelto,
        'detalle': carrito
    })

if __name__ == '__main__':
    app.run(debug=True)
