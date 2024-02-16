(define member?
    (lambda (a lat)
        (if (null? lat)
            #f
            (if (= (car lat) a)
                #t
                (member? a (cdr lat))))))