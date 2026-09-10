$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open('C:\Users\pc\Desktop\Neuro Mind Scholars\server\uploads\resources\1787579616415-afabbffd.doc')
$doc.ExportAsFixedFormat('C:\Users\pc\Desktop\Neuro Mind Scholars\server\uploads\pdfs\test_word.pdf', 17)
$doc.Close()
$word.Quit()
