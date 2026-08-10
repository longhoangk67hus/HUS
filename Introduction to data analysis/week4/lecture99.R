
print("Bai4")
Luong = c(6.0,5.0,4.5,3.8,8.0,12.0,4.0,5.0)
GioiTinh = c("Nam","Nu","Nam","Nu","Nu","Nam","Nam","Nu")
TotNghiep = c("K","K","TB","K","G","G","TB","TB")
Tuoi = c(22,25,23,22,22,23,22,24)
SinhVien = data.frame(Luong,GioiTinh,TotNghiep,Tuoi)
SinhVien
SinhVien[SinhVien$GioiTinh == "Nu",]
subset(SinhVien, GioiTinh == "Nam")
subset(SinhVien, GioiTinh == "Nu",select = Luong)

SinhVien[SinhVien$GioiTinh == "Nu",]$Luong

subset(SinhVien, GioiTinh == "Nam",select = Tuoi)
SinhVien[SinhVien$GioiTinh == "Nam",]$Tuoi
SinhVien[SinhVien$Luong > 6.0,]
SinhVien[SinhVien$Luong == max(Luong),]
newRow = c(Luong = 7.5, GioiTinh = "Nam",TotNghiep = "G",Tuoi = NA)
SinhVien = rbind(SinhVien,newRow)
KhoaLuan = c(8, 7.5, 7, 7, 9, 9.5, 8, 8, 9)
SinhVien = cbind(SinhVien,KhoaLuan)
SinhVien

#du lieu trong cot luong duoc do = thang do so nguyen duong
#du lieu trong cot gioi tinh duoc do = thang do nam/nu
#du lieu trong cot tot nghiep duoc do = thang do G -> K -> TB
#du lieu trong cot tuoi duoc do = thang do so nguyen duong
#du lieu trong cot khoa luan duoc do tren thang 10

SinhVien = na.omit(SinhVien)
SinhVien
#na.omit() loai bo hoan toan hang du lieu chua cot NA

print("Bai 5")
load(file = "HocSinh.rda")
getwd()
dim(DL)
DL[,3]
DL[10,]
sum(DL$GioiTinh == "Nu")
sum(DL$GioiTinh == "Nam")
sum(DL$TheThao == 4) / sum(DL$GioiTinh = "Nu")
sum(DL$TheThao == 4) / sum(DL$GioiTinh == "Nam")

print("Bai6")
dl_50 = DL[sample(nrow(DL),50),]
save(dl_50,file = "random50.rda")

print("Bai7")
seq(1,100)
seq(0,100,by = 2)
rep(c(3,5,16),times = c(4,10,7))
rep(c(1,2,3,4),each = 10)
rep(c(1,2,3),times = 8)
order1 = factor(c("Low","Middle","High"))
rep(order1,each = 4)
order2 = factor(c("Yeu","TB","Kha","Gioi"))
rep(order2,each = 4, length = 15)
order3 = order1
rep(order3,c(2,5,8))