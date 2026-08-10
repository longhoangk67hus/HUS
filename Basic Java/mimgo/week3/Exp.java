package week3;

public class Exp {
    public static void main(String[] args) {
        double x = Double.parseDouble(args[0]);
        int n = Integer.parseInt(args[1]);
        double fraction = 1;
        double e = 1;
        for (int i = 1; i <= n; i++) {
            fraction *= x / i;
            e += fraction;
        }
        System.out.println(Math.round(e * 100.0) / 100.0);
    }
}
