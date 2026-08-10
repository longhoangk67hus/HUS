package homework1.ex4;

public class Main {
    public static void main(String[] args) {
        Sphere sphere1 = new Sphere(3,4,5,6);
        Sphere sphere2 = new Sphere(5,2,3,1);

        System.out.println(sphere1);
        System.out.println(sphere2);

        double area1 = Sphere.getSurroundingArea(sphere1.getRadius());
        System.out.println(area1);
        double area2 = Sphere.getSurroundingArea(sphere2.getRadius());
        System.out.println(area2);

        double volume1 = Sphere.getVolume(sphere1.getRadius());
        System.out.println(volume1);
        double volume2 = Sphere.getVolume(sphere2.getRadius());
        System.out.println(volume2);

        String spaceBetween = sphere1.spaceBetweenTwoSphere(sphere2);
        System.out.println(spaceBetween);
    }
}
