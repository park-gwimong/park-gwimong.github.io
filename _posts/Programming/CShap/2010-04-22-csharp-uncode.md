---
layout: post
title: "C#에서 문자인지 판단하기"
date: 2010-04-22 01:07:00+0900
categories: C#
tags: Program C#
mathjax: true
---


간단한 팁이지만 잊어버릴까봐 남겨두고자 합니다.

C#에서 문자는 유니코드로 표현됩니다.
유니코드는 영어 뿐만 아니라 다른 언어들도 표현하기 위한 코드로 세계 대부분의 언어를 표현할수 있습니다.
정확한 알고 있는 것은 아니지만 아시아의 4개 국가(일본, 중국, 한국, 베트남)이 같은 카테고리로 묶여 있는 것으로 알고 있습니다.
어찌되었든 System.Globalization.UnicodeCategory에 보시면 여러가지 카테고리들이 있습니다.
한글은 OtherLetter에 포함되어 있구요.
밑에 코드 처럼 판별하고자 하는 문자와 같은 카테고리의 속한 경우를 체크하면 한글인지, 영어인지, 숫자인지 등을 판단할 수 있을것입니다.

```csharp
static void Main(string[] args)
        {
            string s = "가나다";
            char[] charArr = s.ToCharArray();
            foreach(char c in charArr)
            {
                if(char.GetUnicodeCategory(c) == System.Globalization.UnicodeCategory.OtherLetter)
                { 
                    Console.WriteLine("한글입니다");
                }
            }
            Console.Read();
        }
```

위 코드로는 영어/숫자/그외 언어(한글,한자,일어 등) 정도로 구분할 수 있습니다.
좀 더 정확한 판단을 위해서는 해당 문자열의 유니코드 코드를 구해 비교해야 합니다.
(참고 URL : http://www.sysnet.pe.kr/Default.aspx?mode=2&sub=0&detail=1&pageno=0&wid=1294&rssMode=1&wtype=0)