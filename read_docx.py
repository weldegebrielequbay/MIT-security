import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text(doc_path):
    try:
        document = zipfile.ZipFile(doc_path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.fromstring(xml_content)
        
        # XML namespace for Word
        WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        PARA = WORD_NAMESPACE + 'p'
        TEXT = WORD_NAMESPACE + 't'
        
        paragraphs = []
        for paragraph in tree.iter(PARA):
            texts = [node.text for node in paragraph.iter(TEXT) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        print('\n'.join(paragraphs))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text(sys.argv[1])
