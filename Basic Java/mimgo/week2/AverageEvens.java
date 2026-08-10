package week2;

public class AverageEvens {
    public static void main(String[] args) {
        int count = 0;
        double sum = 0;
        int n = Integer.parseInt(args[0]);
        for (int i = 1; i <= n; i += 2) {
            sum += i;
            count ++;
        }

        System.out.println(sum/(double) count);
    }
}
