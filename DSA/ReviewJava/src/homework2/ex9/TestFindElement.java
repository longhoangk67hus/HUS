package homework2.ex9;

public class TestFindElement {
    public static void main(String[] args) {
        int[] array = {5,3,1,4,2};
        int target = 3;
        int i = 2;

        int position = FindElementPosition.findElementPosition(array,target, i);

        if (position != -1) {
            System.out.println("Position of a[" + i + "] after sorted is: " + position);
        } else {
            System.out.println("Can't find a[" + i + "] after sorted");
        }
    }
}
