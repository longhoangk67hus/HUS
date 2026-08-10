package homework1.ex4;

public class Sphere {
    private double radius;
    private double x;
    private double y;
    private double z;

    public Sphere(double radius, double x, double y, double z) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    @Override
    public String toString() {
        return "Sphere{" +
                radius +
                ", " + x +
                ", " + y +
                ", " + z +
                '}';
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getZ() {
        return z;
    }

    public void setZ(double z) {
        this.z = z;
    }

    public static double getSurroundingArea(double radius) {
        return 4 * Math.PI * radius * radius;
    }
    public static double getVolume(double radius) {
        return (4/3) * Math.PI * radius * radius * radius;
    }

    public String spaceBetweenTwoSphere(Sphere thatSphere){
        double distance = Math.sqrt(Math.pow(thatSphere.x - this.x,2) +
                                    Math.pow(thatSphere.y - this.y,2) +
                                    Math.pow(thatSphere.z - this.z,2));
        if (distance < this.radius + thatSphere.radius) {
            return "Overlap";
        } else if (distance == this.radius + thatSphere.radius) {
            return "Touching";
        } else if (distance > this.radius + thatSphere.radius) {
            return "Separated";
        } else if (distance + Math.min(this.radius, thatSphere.radius) < Math.max(this.radius, thatSphere.radius)) {
            return "Contained";
        } else {
            return "Touching (externally)";
        }
    }
}
