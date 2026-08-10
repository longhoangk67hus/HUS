package homework2.ex8;

public class SortStringDigit {
    public static String sortString(String input) {
        int[] digitCount = new int[10];
        for (char c : input.toCharArray()) {
            if (Character.isDigit(c)) {
                int digit = Character.getNumericValue(c);
                digitCount[digit]++;

            }
        }
        char[] sortDigits = new char[input.length()];
        int index = 0;

        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < digitCount[i]; j++) {
                sortDigits[index] = (char) (i + '0');
                index++;
            }
        }
        return new String(sortDigits);
    }

}
