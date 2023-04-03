class BookStore {
    constructor(booksLink) {
      this.booksLink = booksLink;
      this.bag = [];
      this.dragBookTitle = "";
      this.total = 0;
      this.validFormElements = ["present"];
      this.isFormValid = false;
      this.orderInfo = {};
    }
  
    async init() {
      let fetchedBooks = await this.fetchBooks();
      this.renderHtml(fetchedBooks);
      this.addListeners();
    }
  
    async fetchBooks() {
      try {
        const response = await fetch(this.booksLink);
        if (!response.ok) {
          const message = `An error has occured: ${response.status}`;
          throw new Error(message);
        }
        const books = await response.json();
        return books;
      } catch {
        throw new Error("Something went wrong!");
      }
    }
  
    addListeners(firstRun = true) {
      if (firstRun) {
        Array.from(document.querySelectorAll(".books-show-more")).forEach(el => el.addEventListener("click", this.showModal.bind(this)));
        Array.from(document.querySelectorAll(".books-add-to-bag")).forEach(el => el.addEventListener("click", this.addToBag.bind(this)));
        Array.from(document.querySelectorAll(".books-item")).forEach(el => el.addEventListener("dragstart", this.dragStart.bind(this)));
        document.querySelector(".bag").addEventListener("dragover", this.dragOver.bind(this));
        document.querySelector(".books").addEventListener("dragover", this.dragOver.bind(this));
        document.querySelector(".bag").addEventListener("drop", this.drop.bind(this));
        document.querySelector(".order-form").addEventListener("input", this.validateForm.bind(this));
        document.querySelector(".order-form").addEventListener("focusout", this.validateForm.bind(this));
        document.querySelector(".order-form").addEventListener("submit", this.submitForm.bind(this));
      } else {
        Array.from(document.querySelectorAll(".bag-remove")).forEach(el => el.addEventListener("click", this.removeBookFromBag.bind(this)));
        if (document.querySelector(".bag-confirm")) {
          document.querySelector(".bag-confirm").addEventListener("click", this.toConfirmationPage.bind(this));
        }
      } 
    }
  
    renderHtml(data) {
      if (!data) {
        return
      }
  
      let fragment = new DocumentFragment();
  
      let main = document.createElement('main');
      main.classList.add('main');
  
      let booksWrapper = document.createElement("div");
      booksWrapper.classList.add("books");
  
      let ul = document.createElement('ul');
      ul.classList.add("books-list");
      ul.setAttribute("id", "books");
  
      let bagWrapper = document.createElement("div");
      bagWrapper.classList.add("bag");
  
      for (let {author, imageLink, price, title} of data) {
        let li = document.createElement("li");
        li.classList.add("books-item");
        li.setAttribute("draggable", "true")
  
        let imageWrapper = document.createElement("div");
        imageWrapper.classList.add("books-img-wrapper");
        imageWrapper.setAttribute("draggable", "false");
  
        let imageElement = document.createElement("img");
        imageElement.setAttribute("alt", title);
        imageElement.setAttribute("src", imageLink);
        imageElement.classList.add("books-img");
        imageElement.setAttribute("draggable", "false")
        imageWrapper.append(imageElement);
        li.append(imageWrapper);
  
        let contentWrapper = document.createElement("div");
        contentWrapper.classList.add("books-content-wrapper");
  
        let titleParagraph = document.createElement("p");
        titleParagraph.classList.add("books-title");
        titleParagraph.innerHTML = title;
        contentWrapper.append(titleParagraph);
  
        let authorParagraph = document.createElement("p");
        authorParagraph.classList.add("books-author");
        authorParagraph.textContent = author;
        contentWrapper.append(authorParagraph);
  
        let priceParagraph = document.createElement("p");
        priceParagraph.classList.add("books-price");
        priceParagraph.textContent = `${price} $`;
        contentWrapper.append(priceParagraph);
  
        let showMore = document.createElement("button");
        showMore.classList.add("books-show-more");
        showMore.textContent = "Show more";
        contentWrapper.append(showMore);
  
        let addToBag = document.createElement("button");
        addToBag.classList.add("books-add-to-bag");
        addToBag.textContent = "Add to bag";
        contentWrapper.append(addToBag);
  
        li.append(contentWrapper)
        ul.append(li);
      }
  
      booksWrapper.append(ul);
  
      main.append(booksWrapper);
      main.append(bagWrapper);
  
      fragment.append(main);
      document.body.prepend(fragment);
    }
  
    async showModal(e, modalType = undefined) {
      if (e) {
        e.preventDefault();
      }
  
      if (modalType === "bookIsInBag") {
        let modalText = document.createElement("p");
        modalText.classList.add("book-in-bag");
        modalText.innerText = "This book is already in bag!";
        e.target.append(modalText);
        setTimeout(() => {
          modalText.remove();
        }, 1000);
      } else {
        let bookName = e.target.parentNode.querySelector(".books-title").innerText;
  
        let allBooks = await this.fetchBooks();
        
        let chosenBook = Array.from(allBooks).filter(el => el.title === bookName)[0];
    
        let {author, description, imageLink, price, title} = chosenBook;
        
        let modalFragment = new DocumentFragment();
    
        let modalWrapper = document.createElement("div");
        modalWrapper.classList.add("modal-wrapper");
    
        let modal = document.createElement("div");
        modal.classList.add("modal");
        
        let modalBookImage = document.createElement("img");
        modalBookImage.setAttribute("src", imageLink);
        modalBookImage.classList.add("modal-img");
    
        let modalTextWrapper = document.createElement("div");
        modalTextWrapper.classList.add("modal-text-wrapper");
    
        let closeBtn = document.createElement("div");
        closeBtn.classList.add("modal-close");
        closeBtn.setAttribute("id", "closeModal");
        modal.append(closeBtn);
    
        let modalBookTitle = document.createElement("p");
        modalBookTitle.classList.add("modal-title");
        modalBookTitle.innerText = title;
        modalTextWrapper.append(modalBookTitle);
    
        let modalBookAuthor = document.createElement("p");
        modalBookAuthor.classList.add("modal-author");
        modalBookAuthor.innerText = author;
        modalTextWrapper.append(modalBookAuthor);
    
        let modalBookDescription = document.createElement("p");
        modalBookDescription.classList.add("modal-description");
        modalBookDescription.innerText = description;
        modalTextWrapper.append(modalBookDescription);
    
        let modalBookPrice = document.createElement("p");
        modalBookPrice.classList.add("modal-price");
        modalBookPrice.innerText = `${price} $`;
        modalTextWrapper.append(modalBookPrice);
    
        modal.append(modalBookImage);
        modal.append(modalTextWrapper);
        modalWrapper.append(modal);
        modalFragment.append(modalWrapper);
        document.body.append(modalFragment);
    
        document.querySelector(".modal-wrapper").classList.add("visible");
        document.querySelector(".modal-wrapper").addEventListener("click", this.closeModal.bind(this));
        document.body.style.overflow = "hidden";
        document.querySelector("#closeModal").addEventListener("click", this.closeModal);
      }
    }
  
    closeModal(e) {
      e.preventDefault();
      e.stopPropagation();
  
      let isWrapperClick = Array.from(e.target.classList).includes("modal-wrapper");
      let isCloseBtnClick = Array.from(e.target.classList).includes("modal-close");
  
      if (!isWrapperClick && !isCloseBtnClick) {
        return
      }
      
      if (isWrapperClick) {
        e.target.remove();
      } 
  
      if (isCloseBtnClick) {
        e.target.parentNode.parentNode.remove();
      }
  
      document.body.style.overflow = "visible";
    }
  
    renderBag() {
      this.clearBag();
  
      let bagElement = document.querySelector(".bag");
  
      let fragment = new DocumentFragment();
  
      let ul = document.createElement("ul");
      ul.classList.add("bag-list");
  
      this.bag.forEach(el => {
        let {author, imageLink, title} = el;
  
        let li = document.createElement("li");
        li.classList.add("bag-item");
    
        let imageWrapper = document.createElement("div");
        imageWrapper.classList.add("bag-img-wrapper");
    
        let imageElement = document.createElement("img");
        imageElement.setAttribute("alt", title);
        imageElement.setAttribute("src", imageLink);
        imageElement.classList.add("bag-img");
        imageWrapper.append(imageElement);
        li.append(imageWrapper);
    
        let contentWrapper = document.createElement("div");
        contentWrapper.classList.add("bag-content-wrapper");
    
        let titleParagraph = document.createElement("p");
        titleParagraph.classList.add("bag-title");
        titleParagraph.innerHTML = title;
        contentWrapper.append(titleParagraph);
    
        let authorParagraph = document.createElement("p");
        authorParagraph.classList.add("bag-author");
        authorParagraph.textContent = author;
        
        let removeBookBtn = document.createElement("div");
        removeBookBtn.classList.add("bag-remove");
        li.append(removeBookBtn);
        
        contentWrapper.append(authorParagraph);
        li.append(contentWrapper);
  
        ul.append(li);
      })
  
      fragment.append(ul);
  
      if (this.bag.length > 0) {
        let totalPriceElement = document.createElement("p");
        totalPriceElement.classList.add("bag-total");
        totalPriceElement.innerText = `Total price: ${this.calculateTotal()} $`;
        
        bagElement.append(fragment);
        bagElement.append(totalPriceElement);
        
        if (!document.querySelector(".bag-confirm")) {
          let confirmOrderElement = document.createElement("button");
          confirmOrderElement.classList.add("bag-confirm");
          confirmOrderElement.innerText = "Confirm order";
          bagElement.append(confirmOrderElement);
        }
    
        this.addListeners(false);
      }
      
  
      let priceEl = document.querySelector(".bag-total") || undefined;
      
      if (priceEl && this.bag.length === 0) {
        priceEl.remove();
      }
  
      let confirmOrderEl = document.querySelector(".bag-confirm") || undefined;
      
      if (confirmOrderEl && this.bag.length === 0) {
        confirmOrderEl.remove();
      }
    }
  
    dragStart(e) {
      e.stopPropagation();
      let title = e.target.querySelector(".books-title").innerText;
      this.dragBookTitle = title;
    }
  
    dragOver(e) {
      e.preventDefault();
    }
  
    drop(e) {
      e.preventDefault();
      this.addToBag(e);
      this.dragBookTitle = "";
    }
  
    async addToBag(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
  
        let bookToAddTitle = this.dragBookTitle || e.target.parentNode.querySelector(".books-title").innerText;
        
        let addedBook = Array.from(await this.fetchBooks()).filter(el => el.title === bookToAddTitle)[0];
        
        let isBookInBag = this.bag.some(item => {
          return addedBook.title === item.title
        });
  
        if (!isBookInBag) {
          this.bag.push(addedBook);
          this.renderBag();
        } else {
          this.showModal(e, "bookIsInBag");
        }
      }
    }
  
    removeBookFromBag(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      } 
      
      let bookName = e.target.parentNode.querySelector(".bag-title").innerHTML;
      
      let removingBookIndex = this.bag.findIndex(el => el.title === bookName);
      
      if (removingBookIndex === -1) {
        return
      }
  
      this.bag.splice(removingBookIndex, 1);
  
      this.renderBag();
    }
  
    clearBag() {
      let element = document.querySelector(".bag");
  
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  
    calculateTotal() {
      let total = this.bag.reduce((acc,curr) => acc + curr.price, 0);
      this.total = total;
  
      return total
    }
  
    toConfirmationPage() {
      document.querySelector("main").remove();
      document.querySelector(".order").classList.add("visible");
    }
  
    validateForm(e) {
      e.preventDefault();
      
      let fieldName = e.target.name;
      let fieldValue = e.target.value;
      let onlyLettersRgx = /^[A-Za-z]+$/;
      let lettersAndNumbersRgx = /^[0-9a-zA-Z]+$/;
      let positiveNumberRgx = /^[1-9]+[0-9]*$/;
      let positiveNumberAndDashRgx = /^[-1-9–]+[-0-9–]*$/;
  
      function textAndNumberValidation(e, fieldName, fieldValue, textLength, regexp) {
        if (regexp.test(fieldValue) && fieldValue.length >= textLength) {
          e.target.className = "valid";
          e.target.nextElementSibling.textContent = "";
          return true;
        } else {
            e.target.className = "invalid";
            if (fieldValue.length < textLength) {
              e.target.nextElementSibling.textContent = `Too short for ${fieldName}`;
            }
  
            if (!regexp.test(fieldValue)) {
              e.target.nextElementSibling.textContent = `You can't use such symbols in ${fieldName} field`;
            }
  
            if (!regexp.test(fieldValue) && fieldValue.length < textLength) {
              e.target.nextElementSibling.textContent = `You can't use such symbols in ${fieldName} field, too short for ${fieldName}`;
            }
  
            if (fieldValue.length === 0) {
              e.target.className = "invalid";
              e.target.nextElementSibling.textContent = "The field can't be empty";
            }
            return false
        }
      }
  
      function dateValidation(e, fieldValue) {
        let today = new Date();
        let inputDate = new Date(fieldValue);
  
        if (fieldValue.length === 0){
          e.target.className = "invalid";
          e.target.nextElementSibling.textContent= "Data field can't be empty";
          return false;
        } 
  
        if (inputDate <= today) {
          e.target.className = "invalid";
          e.target.nextElementSibling.textContent= "Shipping is available from tomorrow date";
          return false;
        } 
        
        e.target.className = "valid";
        e.target.nextElementSibling.textContent= "";
        return true;
      }
  
      function paymentValidation(e) {
        e.target.parentNode.parentNode.classList.remove("invalid");
        if (e.target.value.length === 0) {
          e.target.parentNode.parentNode.lastElementChild.innerText = "Please, choose a value";
          
          !Array.from(e.target.parentNode.parentNode.classList).includes("invalid") ? e.target.parentElement.parentElement.className += " invalid" : null;
        }
        
        return e.target.value.length > 0 ? true : false
      }
  
      function presentValidation (e) {
        let elements = Array.from(e.target.parentElement.querySelectorAll('.checkbox-field-wrapper > input'));
        let checkedElementsQuantity = elements.reduce((acc,curr) => acc + curr.checked,0);
        let moreThanTwoSelected = checkedElementsQuantity > 2;
  
        if (moreThanTwoSelected) {
          e.target.parentElement.getElementsByTagName("span")[0].textContent = "You can't select more than 2 gifts"
        } else {
          e.target.parentElement.getElementsByTagName("span")[0].textContent = ""
        }
  
        return !moreThanTwoSelected
      }
  
      let validation = {
        name: (e) => textAndNumberValidation(e, fieldName, fieldValue, 4, onlyLettersRgx),
        surname: (e) => textAndNumberValidation(e, fieldName, fieldValue, 5, onlyLettersRgx),
        date: (e) => dateValidation(e, fieldValue),
        street: (e) => textAndNumberValidation(e, fieldName, fieldValue, 5, lettersAndNumbersRgx), 
        house: (e) => textAndNumberValidation(e, fieldName, fieldValue, 1, positiveNumberRgx),
        flat: (e) => textAndNumberValidation(e, fieldName, fieldValue, 1, positiveNumberAndDashRgx),
        paymenttype: (e) => paymentValidation(e),
        present: (e) => presentValidation(e),
      }
  
      function checkIsFormValid() {
        validation[fieldName](e) ? this.validFormElements.push(fieldName) : null;
  
        this.validFormElements = Array.from(new Set(this.validFormElements));
  
        !validation[fieldName](e) && this.validFormElements.includes(fieldName) ? this.validFormElements.splice(this.validFormElements.indexOf(fieldName), 1) : null;
  
        if (this.validFormElements.length === Object.keys(validation).length) {
          this.isFormValid = true;
          document.querySelector(".order-complete").classList.remove("disabled");
        } else {
          this.isFormValid = false;
          document.querySelector(".order-complete").classList.add("disabled");
        }
      }
  
      validation[fieldName](e);
      
      checkIsFormValid.bind(this)();
    }
  
    submitForm(e) {
      e.preventDefault();
  
      if (!this.isFormValid) {
        return
      }
      let formData = new FormData(document.forms[0]);
  
      formData.forEach((value, key) => {
        if (key === "present") {
          !this.orderInfo.hasOwnProperty("present") ?  this.orderInfo[key] = [value] : this.orderInfo[key].push(value);
        } else {
          this.orderInfo[key] = value;
        }
      });
      document.querySelector(".order").remove();
  
      function renderThanksForOrderPage() {
        let fragment = new DocumentFragment();
  
        let main = document.createElement('main');
        main.classList.add('thanks');
  
        let thanksTitle = document.createElement("h1");
        thanksTitle.classList.add("thanks-title");
        thanksTitle.innerText = `Thank you for your order, it's been created! Here you can see order information:`
  
        let thanksWrapper = document.createElement("ul");
        thanksWrapper.classList.add("thanks-list");
  
        for (let key in this.orderInfo) {
          let li = document.createElement("li");
          li.classList.add("thanks-item");
  
          let nameOfKey = document.createElement("p");
          nameOfKey.classList.add("thanks-key-name");
          nameOfKey.innerText = decodeText(key);
  
          let valueOfKey = document.createElement("p");
          valueOfKey.classList.add("thanks-value");
          valueOfKey.innerText = this.orderInfo[key];
  
          li.append(nameOfKey);
          li.append(valueOfKey);
          thanksWrapper.append(li);
        }
  
        main.append(thanksTitle);
        main.append(thanksWrapper);
  
        fragment.append(main);
        document.querySelector("body").prepend(fragment);
  
        function decodeText(key) {
          let result = "";
          switch(key) {
            case "name": result = "Customer name: ";
            break;
            case "surname": result = "Customer surname: ";
            break;
            case "date": result = "Shipping date: ";
            break;
            case "street": result = "Shipping street: ";
            break;
            case "house": result = "Shipping house number: ";
            break;
            case "flat": result = "Shipping flat number: ";
            break;
            case "paymenttype": result = "Payment type: ";
            break;
            case "present": result = "Present: ";
            break;
          }
          return result
        }
      }
  
      renderThanksForOrderPage.bind(this)()
    }
  }
  

  let bookStore = new BookStore("./assets/books.json");
  bookStore.init();
