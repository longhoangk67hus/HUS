package homework1.ex5;

import java.util.ArrayList;
import java.util.Scanner;

public class ReverseString {
    public static void main(String[] args) {
        ArrayList<String> lines = readLinesFromInput();
        printLinesInReverseOrder(lines);
    }
    public static ArrayList<String> readLinesFromInput(){
        ArrayList<String> lines = new ArrayList<>();
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter lines of text (Using Ctrl+D to end input)");

        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            lines.add(line);
            line.toLowerCase();
        }

        sc.close();
        return lines;
    }

    public static void printLinesInReverseOrder(ArrayList<String> lines) {
        System.out.println("Reverse order:");
        for (int i = lines.size() - 1; i >= 0; i--) {
            System.out.println(lines.get(i));
        }
    }
}
