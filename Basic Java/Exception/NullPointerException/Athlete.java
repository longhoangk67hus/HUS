package NullPointerException;

public class Athlete {

    private String name;
    private int year;
    private String sport;
    private double weight;
    private double height;


    public Athlete(String name, int year, String sport, double weight, double height) {
        this.name = name;
        this.year = year;
        this.sport = sport;
        this.height = height;
        this.weight = weight;
    }
    public Athlete() {
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getYear() {
        return year;
    }
    public void setYear(int year) {
        this.year = year;
    }
    public String getSport() {
        return sport;
    }
    public void setSport(String sport) {
        this.sport = sport;
    }
    public double getHeight() {
        return height;
    }
    public void setHeight(double height) {
        this.height = height;
    }
    public double getWeight() {
        return weight;
    }
    public void setWeight(double weight) {
        this.weight = weight;
    }

    @Override
    public String toString() {
        return "Athlete [name=" + name + ", year=" + year + ", sport=" + sport + ", height=" + height + ", weight="
                + weight + "]";
    }

}
