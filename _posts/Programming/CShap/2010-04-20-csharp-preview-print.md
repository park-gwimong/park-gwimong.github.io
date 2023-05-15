---
layout: post
title: "C#에서 미리보기로 여라장 프린터 출력하기"
date: 2010-04-20 20:07:30+0900
categories: C#
tags: Program C#
mathjax: true
---

.NET 프레임워크에서는 프린터로 출력하기위한 여러가지 출력 기능을 제공해줍니다.  
바로 PrintPreviewDialog 클래스와 PrintDocument 클래스입니다.  

PrintPreviewDialog 클래스는 미리보기를 생성해주는 클래스고 PrintDocument 클래스는 출력하기 위한 데이터를 지정해주는 클래스입니다.  
즉 PrintPrewviewDialog 클래스로 미리보기 창을 생성해주고 PrintDocument 클래스로 데이터를 넘겨준다음 PrintPreviewDialog 클래스와 연결시켜주면 됩니다.  

 여러 페이지를 출력하고자 할때는 e.HasMorePages을 true로 주시면 됩니다. e.HasMorePages는 출력하고자 하는 페이지가 더 있는지를 체크해주는 값으로 false이면 뒤에 더이상 데이터가 없다는 것을 나타냅니다.  

여기서 한가지 주의해야 할 점은 출력해야 할 페이지가 여러페이지일 경우 document 객체에 BeginPrint 이벤트를 재정의 해주어야 한다는 것입니다. 왜냐하면 미리보기에서 프린트 버튼을 클릭해서 출력하려고 할때 BeginPrint 이벤트가 호출되면서 다시 한번 document를 전부 호출해서 출력하기 때문입니다. 만약에 BeginPrint를 재정의 하지 않으면 미리보기 창을 띄울 때 curpageNumber이 감소되어 0이 되어 있기 떄문에 마지막 페이지만 출력이 될 수 도 있습니다.  

```csharp
 public partial class Form1 : Form
    {
        internal PrintPreviewDialog PrintPreviewDialog1;
        private System.Drawing.Printing.PrintDocument document = new System.Drawing.Printing.PrintDocument();
        private int curPageNumber;
        private int curPageNumber_bak;

        public Form1()
        {
            InitializeComponent();
            this.PrintPreviewDialog1 = new PrintPreviewDialog();
            curPageNumber = 1;

            //Set the size, location, and name.
            this.PrintPreviewDialog1.ClientSize =
                new System.Drawing.Size(400, 300);
            this.PrintPreviewDialog1.Location =
                new System.Drawing.Point(29, 29);
            this.PrintPreviewDialog1.Name = "PrintPreviewDialog1";

            // Associate the event-handling method with the
            // document's PrintPage event.
            this.document.PrintPage +=
                new System.Drawing.Printing.PrintPageEventHandler
                (document_PrintPage);

            this.document.BeginPrint += new System.Drawing.Printing.PrintEventHandler(document_BeginPrint);
            // Set the minimum size the dialog can be resized to.
            this.PrintPreviewDialog1.MinimumSize =
                new System.Drawing.Size(700, 700);

            // Set the UseAntiAlias property to true, which will allow the
            // operating system to smooth fonts.
            this.PrintPreviewDialog1.UseAntiAlias = true;

            curPageNumber = 2;
            curPageNumber_bak = 2;
        }

        void document_BeginPrint(object sender, System.Drawing.Printing.PrintEventArgs e)
        {
            curPageNumber = curPageNumber_bak;
            //throw new NotImplementedException();
        }

        private void document_PrintPage(object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            System.Drawing.Font printFont = new System.Drawing.Font("휴먼모음T", 25, System.Drawing.FontStyle.Regular);

            e.Graphics.DrawString("- " + (curPageNumber) + " -", printFont, System.Drawing.Brushes.Black, 400, 400);
            if (curPageNumber == 0)
            {              
                e.HasMorePages = false;

            }
            else
            {
                e.HasMorePages = true;               
                curPageNumber--;
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            PrintPreviewDialog1.Document = document;

            // Call the ShowDialog method. This will trigger the document's
            // PrintPage event.

            PrintPreviewDialog1.ShowDialog();
        }
    }
```