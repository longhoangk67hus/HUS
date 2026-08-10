package week8;
    /**
     * The Circle class models a circle with a radius.
     */
    public class Circle {  // Save as "Circle.java"
        // private instance variable, not accessible from outside this class
        private double radius;

        // Constructors (overloaded)
        /** Constructs a Circle instance with default value for radius*/
        public Circle() {  // 1st (default) constructor
            radius = 1.0;
        }

        /** Constructs a Circle instance with the given radius */
        public Circle(double radius) {  // 2nd constructor
            /* TODO */
            this.radius = radius;
        }

        /** Returns the radius */
        public double getRadius() {
            /* TODO */
            return radius;
        }

        /** Set new radius */
        public void setRadius(double newRadius) {
            /* TODO */
            this.radius = newRadius;
        }

        /** Returns the area of this Circle instance */
        public double getArea() {
            /* TODO */
            return Math.PI * radius * radius;
        }

        /** Returns the circumference of this Circle instance */
        public double getCircumference() {
            /* TODO */
            return Math.PI * 2 * radius;
        }

        /** Return a self-descriptive string of this instance in the form of Circle[radius=?] */
        public String toString() {
            /* TODO */
            return "Circle[radius" + radius + "]";
        }
    }

