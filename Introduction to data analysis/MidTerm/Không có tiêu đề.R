# y a
matrix1 <- matrix(1:4, nrow = 2)
print(matrix1[2, 2] - matrix1[1, 1])
matrix2 <- matrix(2:5, nrow = 2, byrow = TRUE)
matrix2
print(matrix1 %*% matrix2)
# y b
vec1 <- c(exp(2),exp(5),exp(3),exp(6),exp(1),exp(8))
vec2 <- log(vec1)
print(vec2[c(3, 4)] - vec2[c(1,2)])
vec3 <- rep(x = vec2, times = vec2 - 1)
print(length(vec3[vec3 <5]))
# y c
vec1 <- c(100, 20, 30, 50, 70)
vec2 <- c(20, 60, 80, 40, 110)
if(mean(vec1) > mean(vec2)) {
  print("Trung binhf vec1 lon hon vec 2")
} else {
  print("Trung binh vec1 khong lon hon vec2")
}
# y d
vec1 <- c(2, 3, 5 , 7, 8)
result <- function(x) {
  print(x - mean(vec1))
}
vec2 <- result(vec1)
print(length(vec2[vec2 >= 2]))

# cau 2
install.packages("stringr")
library(stringr)
x <- "Nhap mon phan tich du lieu"

result <- str_split(x, pattern = " ")
result
# cau 3
The_loai <- c("R&B", "Rock", "Rap", "Dong que", "Co dien", "Latin")
So_luong <- c(146.4, 102.6, 73.7, 64.5, 14.8, 14.5)
barplot(So_luong, main = "So luong album duoc ban ra cua tung the loai am nhac",
        sub = "The loai nhac", names.arg = The_loai, ylab = "So luong", ylim = c(0, 150))
mtext("Nghin", at = -0.3)

# y b

The_loai <- c("R&B", "Rock", "Rap", "Dong que", "Co dien", "Latin")
So_luong <- c(146.4, 102.6, 73.7, 64.5, 14.8, 14.5)
category_pct = round(prop.table(So_luong) * 100, 1)
pie(category_pct, labels = paste(The_loai, ":", category_pct, "%", sep = ""), col = rainbow(6), main = "So luong album duoc ban ra cua tung the loai am nhac")


#y d
#par(mfrow = c(1, 2))
# cau 4
data("airquality")
View(airquality)
attach(airquality)
boxplot(Ozone)
# trung vi
median(Ozone, na.rm = T)
# tu phan vi thu nhat
q1 = quantile(Ozone, 0.25, na.rm = T)
q1
# tu phan vi thu 3
q3 = quantile(Ozone = 0.75, na.rm = T)
q3
# khoang tu vi phan
iqr = q3 - q1
iqr
#
vec1 = 1: 5
vec2 = rep(x = vec1, each = 2)
which(vec2 == max(vec2)) #which tra ve index chu khong phai value
#
install.packages("datasets")
library(datasets)
data = iris
View(data)
attach(data)
#
data1 <- data[data$Petal.Length> 1.5 & data$Petal.Width <0.3,]
data1
#
Categorization <- cut(data$Petal.Length, breaks = c(0, 1.3, 1.7, Inf), labels = c("Short", "Average", "Long"))
data <- cbind(data, Categorization)
data
#
so_sanh <- function(x, y) {
  mean1 <- mean(data[data$Species == x & data$Sepal.Length > 3.0 & data$Sepal.Width < 5.0,]$Petal.Length)
  mean2 <- mean(data[data$Species == y & data$Sepal.Length > 3.0 & data$Sepal.Width < 5.0,]$Petal.Length)
  
}