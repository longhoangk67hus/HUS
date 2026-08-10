package homework4.training3;

import java.util.*;

public class FindMiddleIndex {
    public static void deleteMid(Stack<Integer> stack, int size) {
        Queue<Integer> queue = new LinkedList<>();
        int count = 0;
        while (count < size / 2) {
            queue.add(stack.pop());
            count++;
        }
        stack.pop();
        while (count > 0) {
            stack.push(queue.poll());
            count--;
        }
    }

    public static void main(String[] args) {

    }
}
