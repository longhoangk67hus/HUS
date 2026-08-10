package week9.bai2;

public class MyComplex {
    /* TODO */
    private double real = 0D;
    private double imag = 0D;

    public MyComplex() {

    }

    public MyComplex(double real, double imag) {
        this.real = real;
        this.imag = imag;
    }

    public double getReal() {
        return real;
    }

    public void setReal(double real) {
        this.real = real;
    }

    public double getImag() {
        return imag;
    }

    public void setImag(double imag) {
        this.imag = imag;
    }

    public void setValue(double real, double imag) {
        this.real = real;
        this.imag = imag;

    }

    @Override
    public String toString() {
        return "MyComplex{" +
                "real=" + real +
                ", imag=" + imag +
                '}';
    }

    public boolean isReal() {
        return imag == 0;
    }

    public boolean isImaginary() {
        return real == 0;
    }

    public boolean equals(double real, double imag) {
        return (this.real == real) && (this.imag == imag);
    }

    public boolean equals(MyComplex another) {
        return (this.imag == another.imag) && (this.real == another.real);
    }
    public MyComplex addInto(MyComplex right) {
        this.real += real;
        this.imag += imag;
        return this;
    }
    public MyComplex addNew(MyComplex right) {
        return new  MyComplex(this.real + right.real, this.imag + right.imag);
    }




}
