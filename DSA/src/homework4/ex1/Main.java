package homework4.ex1;

import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<Character> stack = new Stack<>();
        String hovaten = "hoten";

        for (int i = 0; i < hovaten.length(); i++) {
            if (i % 2 == 0) {
                stack.push(hovaten.charAt(i));
            }
            if (i % 3 == 0) {
                stack.pop();
            }

        }
        System.out.println(stack);
    }
}
