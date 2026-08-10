package week2;

public class NumberProps {
    //Sinh viên hoàn thiện hàm isPrime, giữ nguyên nguyên mẫu hàm
    public static boolean isPrime(int k) {
        if (k < 2) {
            return false;
        }
        for (int i = 2; i < Math.round(k); i++) {
            if (k % i != 0) {
                return false;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPrime(25));
    }
}

