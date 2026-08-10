package week3;
import java.util.Scanner;
public class SuperPrime {
    public static boolean checkPrime(int n) {
        if (n < 2)  return false;
        for (int i=2; i<= Math.sqrt(n); i++) {
            if(n % 2 == 0) {
                return false;
            }
        } return true;
    }
    public static boolean checkSuperPrime(int n) {
        if (n < 2) return false;
        while (n > 0) {
            if (!checkPrime(n)) return false;
            n = n / 10;
        }
        return true;
    }
    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        int n = scan.nextInt();
        if (checkSuperPrime(n)) {
            System.out.println("True");
        } else {
            System.out.println("False");
        }
    }
}
