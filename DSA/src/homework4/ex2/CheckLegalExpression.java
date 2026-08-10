package homework4.ex2;

public class CheckLegalExpression {
    public static boolean check(String expression) {
        LinkedListStack<Character> stack = new LinkedListStack<>();
        for (char character : expression.toCharArray()
             ) {
            if (character == '(' || character == '[' || character == '{') {
                stack.push(character);
            } else if (character == ')' || character == ']' || character == '}') {
                if (stack.isEmpty()) {
                    return false;
                }
            }
            char top = stack.pop();
            if (!isMatchingPair(top, character)) {
                return false;
            }
        }
        return true;
    }
    private static boolean isMatchingPair(char character1, char character2) {
        return (character1 == '(' && character2 == ')') ||
                (character1 == '[' && character2 == ']') ||
                (character1 == '{' && character2 == '}');
    }
}
