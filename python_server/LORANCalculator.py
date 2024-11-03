import numpy as np

class LORANCalculator:
    def __init__(self, points):
        self.points = points
        toM = 1000
        self.x1, self.y1 = points[0]['x'] * toM, points[0]['y'] * toM
        self.x2, self.y2 = points[1]['x'] * toM, points[1]['y'] * toM
        self.x3, self.y3 = points[2]['x'] * toM, points[2]['y'] * toM

    # Calculates the time difference of arrival error
    def tdoa_error(self, params):
        c = 3e8 / 10e8 

        x, y = params
        d1 = np.sqrt((x - self.x1)**2 + (y - self.y1)**2)
        d2 = np.sqrt((x - self.x2)**2 + (y - self.y2)**2)
        d3 = np.sqrt((x - self.x3)**2 + (y - self.y3)**2)

        delta_t12_calc = (d1 - d2) / c  
        delta_t13_calc = (d1 - d3) / c

        t1 = self.points[0]['timestamp'] / 1000.0 
        t2 = self.points[1]['timestamp'] / 1000.0
        t3 = self.points[2]['timestamp'] / 1000.0

        delta_t12 = (t1 - t2) * 10e8
        delta_t13 = (t1 - t3) * 10e8

        error1 = delta_t12_calc - delta_t12
        error2 = delta_t13_calc - delta_t13

        return [error1, error2]

    # Computes the loss based on the TDOA errors
    def loss_function(self, params):
        errors = self.tdoa_error(params)
        loss = sum(e**2 for e in errors)
        return loss

    # Custom implementation of the least squares optimization
    def custom_least_squares(self, initial_guess, learning_rate=0.01, max_iterations=10000, tolerance=1e-12):
        x, y = initial_guess
        iteration = 0
        prev_loss = float('inf')

        while iteration < max_iterations:
            loss = self.loss_function([x, y])

            if abs(prev_loss - loss) < tolerance:
                print("exit", prev_loss - loss)
                break
            
            prev_loss = loss

            delta = 1e-6
            
            loss_x = self.loss_function([x + delta, y])
            grad_x = (loss_x - loss) / delta
            
            loss_y = self.loss_function([x, y + delta])
            grad_y = (loss_y - loss) / delta

            x -= learning_rate * grad_x
            y -= learning_rate * grad_y
            
            iteration += 1

        return x / 1000, y / 1000, iteration
