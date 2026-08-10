package homework4.ex5;

public class CheckPalindrome {
    public static boolean checkPalindrome(String string) {
        LinkedListStack<Character> stack = new LinkedListStack<>();
        LinkedListQueue<Character> queue = new LinkedListQueue<>();

        for (int i = 0; i < string.length(); i++) {
            stack.push(string.toCharArray()[i]);
            queue.enqueue(string.toCharArray()[i]);
        }
        while (!stack.isEmpty() && !queue.isEmpty()) {
            char stackChar = stack.pop();
            char queueChar = queue.dequeue();

            if (stackChar != queueChar) {
                return false;
            }
        }
        return true;
    }
}
