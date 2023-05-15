---
layout: post
title: "printf()의 Segmentationg fault 차이"
date: 2010-02-19 18:16:00+0900
categories: Programming
tags: C
mathjax: true
---
 
C의 표준 입출력 함수인 printf()에서 Segmentationg fault 발생 시 유의 할 사항에 대해 정리하고자 합니다.  

```c
#include <stdio.h>
char *array[3] = {"aaaa", "bbbb", "ccccc");
int main()
{
printf("%s\n", array[3]);
return 0;
}
```

위에 코드를 컴파일하면 아무런 문제 없이 컴파일 된다. 하지만 코드를 자세히 보면 문제가 있다는것을 바로 알 수 있습니다.  
배열의 크기는 3인데. array[3]의 값을 출력하려고 하니 세그먼트 폴트가 일어날 것입니다.  


실행 결과
> Segmentation fault  

여기까지는 아무런 문제가 없습니다.

하지만 위 코드를 조금만 수정해주면 예상과는 다른 결과가 발생합니다.

```c
#include <stdio.h>
char *array[3] = {"aaaa", "bbbb", "ccccc");
int main()
{
printf("%s\n ", array[3]);
return 0;
}
```

이렇게 코드를 변경해서 컴피일하여 수행하면

> $(null)

이렇게 출력이 됩니다.  
(우분투 9.04에서 GCC 4.3.3 버전으로 테스트 했을 경우입니다)  

달라진 점이 먼지 바로 찾으신 분도 있을지도 모르겠지만.. 저같은 경우는 며칠을 고민했습니다.  

바로 printf("%s\n ")에 \n다음에 공백 하나가 들어가 있습니다.  
왜 이런 결과가 나올까 해서 조금씩 수정해보면서 테스트를 해보았습니다. 전 아는게 없어서 이런식으로 일일히 테스트해가면서 문제점을 해결합니다 ㅜㅜ  

먼저 공백을 다른 곳에 줘봤습니다.  

```c
printf(" %s\n");
```

결과는

> $ (null)  

공백을 뒤에 주나 앞에 주나 같은 결과가 나오네요.  

그다음엔 \n을 빼고 해보았습니다.
```
printf("%s")
printf(" %s")
printf"%s ")
```

결과는 각각
```
$(null)    
$ (null)   
$(null)  
```
잘 출력이 되네요....  
그다음 의심한 부분은 배열 선언했을때 문제가 생기지 않았을까 하는 것이였습니다.  
대체 array[3]에 어떤 값이 들어 있길래 저렇게 출력이 되는가 싶어서 GDB로 확인해봤습니다.

>(gdb) p &array[2]  
&9 = (char **) 0x804a01c  
(gdb) p &array[3]  
&10 = (char **) 0x804a020  
(gdb) p array[3]  
$11 = 0x0  

응?? 머지... 실제로 문자열이 저장되어 있는 부분은 조금 다르긴 하지만...  
어찌됬든 array[3]에는 "\0"값이 들어가 있긴 하네요.  

그럼 이제 의심이 되는 부분은... 왜 문자열이 다르게 저장되는가.. 그건 아마도 컴파일러가 먼가 최적화 한다고 깨작되서 그런게 아닐까..  

해서 main()를 disassemble 해봤습니다.  

```c
printf("%s\n") 하였을 때
0x080483da <main+22>:          mov          %eax, 0x4(%esp)
0x080483da <main+26>:          movl         %0x80484d0, (%esp)
0x080483da <main+33>:          call           %0x80482f8 printf@plt
0x080483da <main+38>:          mov          %0x0, %eax
0x080483da <main+43>:          add          %0x14, %esp
0x080483da <main+46>:          pop          %ecx
```

printf("%s\n ") 하였을 때  
```c
0x080483da <main+22>:          mov          %eax,  (%esp)
0x080483da <main+25>:          movl         %0x80484d0, (%esp)
0x080483da <main+30>:          call           %0x80482ff puts@plt
0x080483da <main+35>:          mov          %0x0, %eax
0x080483da <main+38>:          add          %0x4, %esp
```

보시면 실제로 출력하기 위한 함수를 부르는 부분이 다르다는 것을 알 수 있습니다.  

printf()와 puts()의 차이점....은 %s가 포함되어 있는가 아닌가의 차이정도라고 할 수 있는데 컴파일러가 인자로 %S\n만 들어오는 경우  
puts("%s")와 printf("%s\n")는 같은 결과를 나타내기 때문에 자동으로 변환 시켜주는것 같습니다  

내부적으로 printf와 puts의 함수를  자세히 보면 좀 더 확실하게 알 수 있겟지만...  
참고로 비주얼 스튜디오에서 테스트한 결과도 같았습니다 :)  