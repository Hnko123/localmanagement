import sys
sys.path.append(r'C:\Users\Hakan\Desktop\\gmail\\portable_etsy_manager')
try:
    import app.simple_test
    print('Imported simple_test:', app.simple_test.x)
except Exception as e:
    print('Import error for simple_test:', e)