package week9.bai1;

public class Baby {


        // khai báo các thuộc tính của một baby
        // tạo tất cả các hàm dựng (có đối và không đối)
        // xây dựng các hàm getter, setter phù hợp với các thuộc tính
        private String day = "01/01/2020";
        private String name = "UnRegistered";
        private boolean gender;
        private double weight, length;
        public Baby() {
        }

        public Baby(String bbName, String bbDay, boolean bbGender, double bbWeight, double bbLength) {
                this.day = bbDay;
                this.name = bbName;
                this.gender =bbGender;
                this.weight = bbWeight;
                this.length = bbLength;
        }
        /*
            Lưu ý, đối với hàm public String getGender() sẽ trả về Boy nếu gender = false, ngược lại trả về "Girl"
        */

        public String getDay() {
                return day;
        }

        public void setDay(String day) {
                this.day = day;
        }

        public String getName() {
                return name;
        }

        public void setName(String name) {
                this.name = name;
        }

        public String getGender() {
                return this.gender ? "Girl" : "Boy";
        }

        public void setGender(boolean gender) {
                this.gender = gender;
        }

        public double getWeight() {
                return weight;
        }

        public void setWeight(double weight) {
                this.weight = weight;
        }

        public double getLength() {
                return length;
        }

        public void setLength(double length) {
                this.length = length;
        }
        // in ra thong tin cua baby theo thu tu: ten, ngay thang nam sinh, gioi tinh, can nang, chieu cao

        public String toString() {
            return getName() + " " + this.day + " " + getGender() + "  " + this.length + " " + this.weight;
        }

    }

