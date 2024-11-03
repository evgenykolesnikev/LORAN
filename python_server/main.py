from flask import Flask, request, jsonify
from LORANCalculator import LORANCalculator

app = Flask(__name__)

@app.route('/loran', methods=['POST'])
def calculate():
    if request.is_json:
        
        data = request.get_json()

        try:
            # Extracting parameters from JSON data
            points = data['points']
            emulation_zone_size = data['emulationZoneSize']
            
            # Creating an instance of LORANCalculator
            loran_calculator = LORANCalculator(points)
            
            # Performing the calculation with the initial guess (the center point of the zone)
            initial_guess = [float(emulation_zone_size['width']) / 2, float(emulation_zone_size['height']) / 2]
            x_opt, y_opt, iterations = loran_calculator.custom_least_squares(initial_guess)
            
            return jsonify({'x': float(x_opt), 'y': float(y_opt)}), 200

        except KeyError as e:

            return jsonify({'error': f'Missing key: {e}'}), 400

    return jsonify({'error': 'Invalid JSON data'}), 400

if __name__ == '__main__':

    app.run(host='localhost', port=5000)
