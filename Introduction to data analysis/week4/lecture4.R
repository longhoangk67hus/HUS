#Bai1
dat = read.csv("/Users/ngoclong7204/Documents/Workspace/Phân tích dữ liệu//week4/Product.csv" ,header = TRUE)
dat

dat1 = dat[dat$City == "Boston",]
dat1

dat2 = dat[dat$Product == "Carrot",]
sum(dat2$TotalPrice)

dat1 = dat1[dat1$Product == "Carrot",]
dat1

mean(dat1$Quantity)

#Bai2
data = read.csv("//Users/ngoclong7204//Documents/Workspace//Phân tích dữ liệu///week4/dulieu2.csv" ,header = TRUE)
data

data1 = data[data$Product == "Velo" | data$Product == "Paseo",]
#data1
max_value = max(data$Manufacturing.Price)
max_data = subset(data,Manufacturing.Price == max_value)
max_data$Country

seq(1, 100)
seq(0,100, 2)
rep(c(3,5,16),c(4,10,7))
rep(1:4, each = 10)

xucxac = sample(1:6,100,replace = T)
sum(xucxac == 6)

x = sample(c(1,2,3,4),10,replace = TRUE)
x

sumresult = function(x) {
  result = 0
  for (i in 1:length(x)) {
    result = result + x[i]^i
  }
  print(result)
}
sumresult(x)        

#apply(x,margin,fun)
#x: matran - dataframe
#margin: = 1 -> performed on rows
#nmargin = 2 -> performed on cols
#margin = c(1,2) -> both rows and cols
#fun: which function to apply


apply(A,1,sum)
tong = function(x) {
  for (i in 1:nrow(x)) {
    sum = 0
    for (j in 1:ncol(x)) {
      sum = sum + x[i,j]
    }
    print(sum)
  }
}
tong(A)
#lapply(x,fun). tra ve 1 list
names <- c("long","lam","linh")
lapply(names,toupper)
#sapply(x,fun) -> tra ve 1 vector / 1 matrix
sample_data <- data.frame(
  x=c(1,2,3,4,5,6),
  y=c(3,2,4,2,34,5)
)
sapply(sample_data, max)
