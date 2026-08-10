### Bai 1
A <- matrix(c(1,5,1,-1), nrow = 2)

B <- matrix(c(7,-3,3,7), nrow = 2)
E <- matrix(c(1,0,0,1), nrow = 2)
div <- (B - E)/A
print(div)
### Bai 2
work_time <- c(17, 16, 20, 24, 22, 15, 21, 15, 17, 22)
### y a
min(work_time)
max(work_time)
mean(work_time)
### y b
work_time <- c(17, 16, 20, 24, 22, 15, 21, 15, 17, 22)
 false_index <- which(work_time == 22)
work_time[which(work_time == 22)] <- 15
work_time
### y c
work_time <- c(17, 16, 20, 24, 22, 15, 21, 15, 17, 22)
long_day <- length(which(work_time >= 20))
long_day

so_ngay_it_hon_17 <- sum(work_time <= 17)
ti_le_phan_tram <- (so_ngay_it_hon_17 / length(work_time)) * 100
print(ti_le_phan_tram)
### y d
work_time <- c(17, 16, 20, 24, 22, 15, 21, 15, 17, 22)
work_time2 <- c(work_time, c(22, 23, 18, 25,20))
work_time2
a <- mean(work_time)
b <- mean(work_time2)
c <- a - b
print(paste("Gia tri trung binh moi", c))





### bai 1
### y a
TienDT <- c(198, 185, 223, 221, 207, 203, 180, 195, 222, 177, 214, 216)
### y b
sum(TienDT)
### y c
print(paste("Thang co so tien cao nhat la", which.max(TienDT), "va so tien la", max(TienDT)))
print(paste("Thang co so tien cao nhat la", which.min(TienDT), "va so tien la", min(TienDT)))
### y d
TienDT <- c(198, 185, 223, 221, 207, 203, 180, 195, 222, 177, 214, 216)
print(paste("Nhung thang ban phai tra hon 200k tien: ", which(TienDT >= 200), "va co", length(which(TienDT >= 200)), "thang nhu vay"))
### y e
less_than_190 <- length(which(TienDT <= 190))
less_than_190
### y f
more <- length(which(TienDT >= 190 & TienDT <= 210))
more
### bai 2
### y b
TienDT[2] <- 175
TienDT
### y c
TienDT <- c(TienDT, c(201, 185))
mean_tien <- (sum(TienDT)/length(TienDT) + 1)
mean_tien

### bai 4
### y a
Luong <- c(6.0, 5.0, 4.5, 3.8, 8.0, 12.0, 4.0, 5.0)
GioiTinh <- c("Nam", "Nu", "Nam", "Nu", "Nu", "Nam", "Nam", "Nu")
TotNghiep <- c("K", "K", "TB", "K", "G", "G", "TB","TB")
Tuoi <- c(22, 25, 23, 22, 22, 23, 22, 24)
SinhVien <- data.frame(Luong, GioiTinh, TotNghiep, Tuoi)
SinhVien
### y b
SinhVien[SinhVien$GioiTinh == "Nu",]
### y c
SinhVien[SinhVien$GioiTinh == "Nam",]
### y d
SinhVien[SinhVien$GioiTinh == "Nu",]$Luong
### y e
SinhVien[SinhVien$GioiTinh == "Nam",]$Tuoi
### y f
SinhVien[SinhVien$Luong >= 6.0,]
### y g
SinhVien[SinhVien$Luong == max(Luong),]
### y h
newRow <- c(Luong = 7.5, GioiTinh = "Nam", TotNghiep = "G", Tuoi = NA)
SinhVien <- rbind(SinhVien, newRow)
SinhVien
### y i
KhoaLuan <- c(8, 7.5, 7, 7, 9, 9.5, 8, 8, 9)
SinhVien <- cbind(SinhVien, KhoaLuan)
SinhVien
### y k
SinhVien <- na.omit(SinhVien)
SinhVien

### Bai 5
load(file = "/Users/ngoclong7204/Documents/Workspace/Introduction to data analys/week4/HocSinh.rda")
getwd()
###dim() method is use to get the cols and rows of a matrix or a data frame
dim(DL)
### y c
DL[,3]
### y d
DL[10,]
### y e
sum(DL$GioiTinh == "Nam")
sum(DL$GioiTinh == "Nu")
### y f
