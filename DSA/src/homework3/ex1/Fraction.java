package homework3.ex1;


public class Fraction {
    private float numerator;
    private float denominator;

    public Fraction(float numerator, float denominator) {
        this.numerator = numerator;
        this.denominator = denominator;

    }

    public Fraction() {
    }

    public Fraction add(Fraction c) {
        if (checkFalseFraction(this) || checkFalseFraction(c)) {
            throw new IllegalArgumentException("Input list is empty");
        }
        Fraction total = new Fraction();
        if (this.denominator == c.denominator) {
            total.numerator = this.numerator + c.numerator;

        } else {
            total.numerator = this.numerator * c.denominator
                    + c.numerator * this.denominator;
            total.denominator = this.denominator * c.denominator;

        }
        return normalize(total);
    }

    public Fraction addMany(Fraction[] fractions) {
        Fraction total = new Fraction();
        for (int i = 0; i < fractions.length; i++) {
            if (checkFalseFraction(fractions[i])) {
                return null;
            }
            if (fractions[i].denominator == fractions[i + 1].denominator) {
                total.numerator += fractions[i].numerator;
            } else {
                float lcm = total.denominator * fractions[i].denominator
                        / gcd(total.denominator, fractions[i].denominator);
                total.numerator = total.numerator * (lcm / total.denominator)
                                + fractions[i].numerator * (lcm / fractions[i].denominator);
                total.denominator = lcm;
            }
        }
        return normalize(total);
    }

    public Fraction minus(Fraction c) {
        if (checkFalseFraction(this) || checkFalseFraction(c)) {
            return null;
        }

        Fraction minus = new Fraction();
        if (this.denominator == c.denominator) {
            minus.numerator = this.numerator + c.numerator;

        } else {
            minus.numerator = this.numerator * c.denominator
                    - c.numerator * this.denominator;
            minus.denominator = this.denominator * c.denominator;

        }
        return normalize(minus);
    }

    public Fraction multi(Fraction c) {
        if (checkFalseFraction(this) || checkFalseFraction(c)) {
            return null;
        }
        Fraction product = new Fraction();
        product.numerator = this.numerator * c.numerator;
        product.denominator = this.numerator * c.denominator;
        return normalize(product);
    }

    public Fraction divide(Fraction c) {
        if (checkFalseFraction(this) || checkFalseFraction(c)) {
            return null;
        }
        Fraction product = new Fraction();

        return normalize(product);
    }

    public Fraction normalize(Fraction c) {
        c.numerator /= gcd(c.numerator, c.denominator);
        c.denominator /= gcd(c.numerator, c.denominator);
        return c;
    }


    public float getNumerator() {
        return numerator;
    }

    public float getDenominator() {
        return denominator;
    }

    @Override
    public String toString() {
        return numerator + "/" + denominator;
    }

    private static float gcd(float a, float b) {
        while (b > 0) {
            float temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    private static float lcm(float a, float b) {
        return a * (b / gcd(a, b));
    }

    private static boolean checkFalseFraction(Fraction fraction) {
        return fraction.denominator != 0;

    }
}
