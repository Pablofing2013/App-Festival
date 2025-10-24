from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite llamadas desde JS si usás fetch

# Lista de productos (en memoria por ahora)
items = [
]

@app.route('/')
def index():
    return render_template('index.html', items=items)

@app.route('/items', methods=['GET'])
def get_items():
    return jsonify(items)

@app.route('/items', methods=['POST'])
def add_item():
    data = request.get_json()
    nombre = data.get('nombre')
    precio = data.get('precio')
    if nombre and isinstance(precio, (int, float)):
        items.append({'nombre': nombre, 'precio': precio})
        return jsonify({'status': 'ok', 'items': items})
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
