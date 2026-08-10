package homework4.ex2;

import java.util.Stack;

public class ExpressionEvaluator {
    public static boolean isValidExpression(String expression) {
        Stack<Character> stack = new Stack<>();
        for (char ch : expression.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                stack.push(ch);
            } else if (ch == ')' || ch == ']' || ch == '}') {
                if (stack.isEmpty()) {
                    return false;
                }
                char top = stack.pop();
                if ((ch == ')' && top != '(') || (ch == ']' && top != '[') || (ch == '}' && top != '{')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    public static double evaluateExpression(String expression) {
        if (!isValidExpression(expression)) {
            System.out.println("Biểu thức không hợp lệ về dấu ngoặc");
            return Double.NaN; // Hoặc bạn có thể xử lý lỗi khác ở đây.
        }

        Stack<Double> values = new Stack<>();
        Stack<Character> operators = new Stack<>();

        for (char ch : expression.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                // Nếu gặp dấu mở ngoặc, thêm vào stack operators
                operators.push(ch);
            } else if (ch == ')' || ch == ']' || ch == '}') {
                // Nếu gặp dấu đóng ngoặc, thực hiện tính toán
                char openBracket = operators.pop();
                while (!operators.isEmpty() && operators.peek() != openBracket) {
                    calculate(values, operators);
                }
                operators.pop(); // Loại bỏ dấu mở ngoặc khỏi stack operators
            } else if (isOperator(ch)) {
                while (!operators.isEmpty() && hasHigherPrecedence(operators.peek(), ch)) {
                    calculate(values, operators);
                }
                operators.push(ch);
            } else {
                // Nếu là toán hạng, thêm vào stack values
                StringBuilder operand = new StringBuilder();
                while (Character.isDigit(ch) || ch == '.') {
                    operand.append(ch);
                    if (!values.isEmpty()) {
                        calculate(values, operators);
                    }
                }
                values.push(Double.parseDouble(operand.toString()));
            }
        }

        while (!operators.isEmpty()) {
            calculate(values, operators);
        }

        if (values.size() == 1) {
            return values.pop();
        } else {
            System.out.println("Lỗi trong biểu thức");
            return Double.NaN; // Hoặc bạn có thể xử lý lỗi khác ở đây.
        }
    }

    private static void calculate(Stack<Double> values, Stack<Character> operators) {
        if (values.size() < 2 || operators.isEmpty()) {
            return;
        }
        char operator = operators.pop();
        double operand2 = values.pop();
        double operand1 = values.pop();
        double result = performOperation(operand1, operand2, operator);
        values.push(result);
    }

    private static boolean isOperator(char ch) {
        return ch == '+' || ch == '-' || ch == '*' || ch == '/';
    }

    private static boolean hasHigherPrecedence(char operator1, char operator2) {
        return (operator1 == '*' || operator1 == '/') && (operator2 == '+' || operator2 == '-');
    }

    private static double performOperation(double operand1, double operand2, char operator) {
        switch (operator) {
            case '+':
                return operand1 + operand2;
            case '-':
                return operand1 - operand2;
            case '*':
                return operand1 * operand2;
            case '/':
                if (operand2 == 0) {
                    System.out.println("Chia cho 0");
                    System.exit(1);
                }
                return operand1 / operand2;
            default:
                return 0;
        }
    }

    public static void main(String[] args) {
        String expression1 = "(1 + ((2 + 3) * (8 * 5))";
        String expression2 = "(5 - (8 - 4) * (2 + 3)) + (8/4)";

        if (isValidExpression(expression1)) {
            double result = evaluateExpression(expression1);
            System.out.println("Giá trị của biểu thức 1: " + result);
        } else {
            System.out.println("Biểu thức 1 không hợp lệ về dấu ngoặc");
        }

        if (isValidExpression(expression2)) {
            double result = evaluateExpression(expression2);
            System.out.println("Giá trị của biểu thức 2: " + result);
        } else {
            System.out.println("Biểu thức 2 không hợp lệ về dấu ngoặc");
        }
    }
}