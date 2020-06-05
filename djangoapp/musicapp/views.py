from django.shortcuts import render,redirect

def main_page(request):
    return render(request,'musicapp/_index.html',{})
    

