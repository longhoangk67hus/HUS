package homework2.ex7;

import java.util.Random;
import java.util.Scanner;

public class TestCountingCouples {
    public static void main(String[] args) {
//        int[] array = {1,2,3,4,5};
//        int x = 7;
//        int result = countPairsWithSum(array, x);
//        System.out.println("Số cặp i < j mà ai + aj = x là: " + result);
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the length of the array: ");
        int n = sc.nextInt();
        System.out.print("Enter the target number: ");
        int x = sc.nextInt();
        Random random = new Random(10);
        int[] array = new int[n];
        for (int i = 0; i < n; i++) {
            array[i] = random.nextInt();
        }
        System.out.print("Array: ");
        CountingCouples.printArray(array);
        int result = CountingCouples.countPairsWithSum(array, x);
        System.out.println("\nSố cặp i < j mà ai + aj = x là: " + result);
    }
}
