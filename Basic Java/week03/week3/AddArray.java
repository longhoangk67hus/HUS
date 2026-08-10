package week3;
import java.util.Scanner;
public class AddArray {
    public static void sumArray(int[] A, int[] B) {
        int[] C = new int[A.length];
        for (int i = 0; i < A.length; i++) {
            C[i] = A[i] + B[i];
        }
        // Duyệt từng phần tử trong mảng C
        for (int i : C){
            System.out.print(i + " ");
        }
    }

    public static void main(String[] args) {
        Scanner sc =  new Scanner(System.in);
        int n=  sc.nextInt();
        int[] A = new int[n];
        int[] B = new int[n];
        for (int i = 0; i < n; i++) {
            A[i] = sc.nextInt();
        }
        for (int i = 0; i < n; i++) {
            B[i] = sc.nextInt();
        }
        sumArray(A, B);

    }
}
