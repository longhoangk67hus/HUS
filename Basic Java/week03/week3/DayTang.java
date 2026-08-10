package week3;

public class DayTang {
    public static boolean csn(int[] array) {
        if (array.length <2) {
            return false;
        }
        double g = 1;
        if (array[0] != 0) {
            g = array[1] / (double) array[0];
        }
        for (int i = 1; i < array.length -1; i++) {
            if (array[i] * g != array[i + 1] ) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(csn(new int[]{2,4,8,16}));
        System.out.println(csn(new int[]{3,5,7,4,-4,-9,34,5668,4,2345,45756}));
        System.out.println(csn(new int[]{3,5,7,4,-4,9,34,-5668,-4,2345,45756}));
        System.out.println(csn(new int[]{3,5,7,4,4,9,34,5668,4,2345,45756}));
    }
}
