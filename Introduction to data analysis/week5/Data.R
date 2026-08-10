#Cau 1
#a
TienDT = c(198, 185, 223, 221, 207, 203, 180, 195, 222, 177, 214, 216)
#b
sum(TienDT)
#c
min(TienDT)
which(TienDT = min(TienDT))
#d
which(TienDT > 200)
sum(TienDT > 200)
#e
which(TienDT <= 190)
sum(TienDT <= 190)
mean(sum(TienDT >= 190 && TienDT <= 210))
mean(TienDT)

#Cau 2
#a
save(TienDT, file = "TienDT.rda")
#b
TienDT[2] = 175
#c
TienDT[c(13,14,15)] = c(NA, 201, 185)
TienDT
mean(TienDT, na.rm = TRUE)

#Cau 3
x = c(1,3,5,7,9)
y = c(1,2,8,6,4,5,7)
z = c(2,8,1,0,3)
#a
z - x
x + z
x * z
z / x
#b
x + 1
y * 2
length(x)
length(y)
x + y
#c
sum(x > 5)
sum(x[x > 5])

#Cau 4
#a
Luong = c(6.0, 5.0, 4.5, 3.8, 8.0, 12.0, 4.0, 5.0)
GioiTinh = c("Nam", "Nu", "Nam", "Nu", "Nu", "Nam", "Nam", "Nu")
TotNghiep = c("K", "K", "TB", "K", "G", "G", "TB", "TB")
Tuoi = c(22, 25, 23, 22, 22, 23, 22, 24)
SinhVien = data.frame(Luong, GioiTinh, TotNghiep, Tuoi)
View(SinhVien)
#b
SinhVien[SinhVien$GioiTinh == "Nu",]

#c
SinhVien[SinhVien$GioiTinh == "Nam",]
#d
SinhVien[SinhVien$GioiTinh == "Nu",]$Luong
#e
SinhVien[SinhVien$GioiTinh == "Nam",]$Tuoi
#f
SinhVien[SinhVien$Luong > 6.0,]
#g
SinhVien[SinhVien$Luong == max(SinhVien$Luong),]
#h
SinhVien <- rbind(SinhVien, c(7.5, "Nam", "Gioi", NA))
SinhVien
#i
KhoaLuan = c(8, 7.5, 7, 7, 9, 9.5, 8, 8, 9)
SinhVien <- cbind(SinhVien, KhoaLuan)
SinhVien
#j
#Tuoi: Thang do ti le
#Luong: Thang do ti le
#GioiTinh: Thang do dinh danh
#XepLoai: Thang do thu bac
#Khoa luan: Thang do ti le
#k
na.omit(SinhVien)

