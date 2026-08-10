package homework4.codelearn.ex13;

import java.util.Scanner;

public class ReverseStackIndex {
    public static void main(String[] args) {
        //Scanner sc = new Scanner(System.in);
        String sc = "codelearn";
        String reverseString = reverseString(sc);

        System.out.println("Original String: " + sc);
        System.out.println("Reversed String: " + reverseString);
    }

    public static String reverseString(String input) {
        LinkedListStack<Character> stack = new LinkedListStack<>();


        for (int i = 0; i < input.length(); i++) {
            stack.push(input.toCharArray()[i]);
        }
        StringBuilder reversed = new StringBuilder();
        while (!stack.isEmpty()) {
            reversed.append(stack.pop());

        }
        return reversed.toString();
    }
}
