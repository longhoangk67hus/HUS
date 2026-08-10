package homework4.codelearn.ex19;
import java.util.LinkedList;

import java.util.Queue;
import java.util.Scanner;


public class ScreenShow {
    public static void show(int[] a, int k){
        Queue<Integer> integerQueue = new LinkedList<>();
        integerQueue.add(a[0]);
        for (int i : a) {
            if (integerQueue.contains(a[i])) {
                continue;
            }
            if (integerQueue.size() == k) {
                integerQueue.poll();
            }
            integerQueue.add(a[i]);
        }
        for (Integer integer:
             integerQueue) {
            System.out.print(integer + " ");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] array = new int[n];
        for (int i = 0; i < n; i++) {
            array[i] = sc.nextInt();
        }
        int k = sc.nextInt();
        show(array, k);
    }
}
