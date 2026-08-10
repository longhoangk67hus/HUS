package week2;

public class SumEven {
    public static void main(String[] args) {
        int sum =0;
        int n = Integer.parseInt(args[0]);
        for (int i = 0; i <= n; i+=2) {
            sum += i;
        }
        System.out.println(sum);
    }
}
