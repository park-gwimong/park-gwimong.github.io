---
layout: post
title: "우분투에서 group 복구하기"
date: 2010-08-23 09:37:00+0900
categories: Linux
tags: Linux Utility Groub
mathjax: true
---

우분투와 윈도우를 멀티부팅으로 사용하다가 윈도우를 포맷을 하고 다시 설치하니 Grub가 날아갔습니다.  
윈도우는 설치시 MBR에 자신의 로더를 덮어씌우기 때문에 어쩔수 없이 Grub를 다시 설치해주어야합니다.  

1. 먼저 우분투 live CD을 넣고 "설치하지 않고 사용하기"로 우분투로 부팅을 합니다  
2. 터미널상에서
```
ubunt#sudo -i
```  
을 입력하여 root권한을 얻습니다.  
sudo로 매번 root권한을 얻어도 되지만 앞으로 하는 진행되는 작업들 모두 root권한을 필요로 함으로 root권한을 얻은채로 작업을 하는 것이 쉽습니다.  

3. 먼저 현재 리눅스가 깔린 파티션을 알아야합니다  
```
root#fdisk -l
```

4. 우분투가 깔린 파티션을 root에 마운트 시킵니다
root#mount /dev/sda5 /root

5. 마지막으로 마운트 시킨 root디렉토리에 gurb복구할 디스크를 지정합니다
```
root#grub-install --root-directory=/root /dev/sda
```
여기서 sda는 리눅스 파티션이 있는 물리하드디스크의 값입니다.  간단하게 리눅스가 깔린 파티션 이름의 숫자부분을 빼면 됩니다.  
