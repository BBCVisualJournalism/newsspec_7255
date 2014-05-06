library(XLConnect)
library(sqldf)
setwd('base-path-to-data-folder/NHS winter watch/john ranking test')

getAEPerformance <- function (filepath) {
  print(paste('Processing data for', filepath, sep=' ... '))
  ae_performance_wb <- loadWorkbook(filepath)
  performance <- readWorksheet(ae_performance_wb, sheet = "A&E Data")
  performance <- performance[18:268, c(3,4,5,9,8,9,10,11)]
  colnames(performance) <- c('perf_code', 'perf_name', 'attendances_total', 'attendances_over4hrs', 'type_all', 'type1', 'type2', 'type3')

  performance <- performance[performance$attendances_total != 0,]
  
  performance$attendances_total <- as.integer(gsub(',', '', performance$attendances_total))
  performance$attendances_over4hrs <- as.numeric(gsub(',', '', performance$attendances_over4hrs))
  return(performance[,c('perf_code', 'perf_name', 'attendances_total', 'attendances_over4hrs', 'type_all', 'type1', 'type2', 'type3')])
}

attendances_over4hrs <- data.frame()
attendances_total <- data.frame()
england_attendances <- data.frame()

for(foldername in list.files(pattern='week*')) {
  print(foldername)
#   foldername = paste('week', folderindex, sep = '')
  projectFiles <- list.files(path = foldername, pattern = '*.xls*')
  # load workbooks
  for(file in projectFiles) {
    if (substring(file, 1, 5) != 'Daily') {
      all_data <- getAEPerformance(paste(foldername, file, sep='/'))
      if (nrow(attendances_over4hrs) == 0) {
        attendances_over4hrs <- all_data[,c('perf_code', 'perf_name', 'attendances_over4hrs')]
        colnames(attendances_over4hrs) <- c('perf_code', 'perf_name', foldername)
        
        attendances_total <- all_data[,c('perf_code', 'attendances_total')]
        colnames(attendances_total) <- c('perf_code', foldername)
      } else {
        all_data$perf_name <- NULL
        under4hrs <- all_data[,c('perf_code', 'attendances_over4hrs')]
        colnames(under4hrs) <- c('perf_code', foldername)
        attendances_over4hrs <- merge(attendances_over4hrs, under4hrs, by.x = 'perf_code', by.y = 'perf_code')
        
        attend_total <- all_data[,c('perf_code', 'attendances_total')]
        colnames(attend_total) <- c('perf_code', foldername)
        attendances_total <- merge(attendances_total, attend_total, by.x = 'perf_code', by.y = 'perf_code')
      }
      
      eng_tmp <- all_data[,c('type_all', 'type1', 'type2', 'type3')]
      eng_tmp$type_all <- as.numeric(gsub(',', '', eng_tmp$type_all))
      eng_tmp$type1 <- as.numeric(gsub(',', '', eng_tmp$type1))
      eng_tmp$type2 <- as.numeric(gsub(',', '', eng_tmp$type2))
      eng_tmp$type3 <- as.numeric(gsub(',', '', eng_tmp$type3))
      eng_tmp$type_sums <- rowSums(eng_tmp[,2:4])
      eng_tmp$under4hrs <- eng_tmp$type_all - eng_tmp$type_sums
      
      england_attendances <- rbind(england_attendances, colSums(eng_tmp, na.rm=TRUE))
    }
  }
}

attendances_over4hrs$total_over4hrs <- rowSums(attendances_over4hrs[,3:ncol(attendances_over4hrs)])
attendances_total$mean_attendances <- rowMeans(attendances_total[,2:ncol(attendances_total)])
attendances_total$total_attendance <- rowSums(attendances_total[,2:(ncol(attendances_total)-1)])

out_data <- merge(attendances_over4hrs[,c('perf_code', 'perf_name', 'total_over4hrs')], attendances_total[,c('perf_code', 'mean_attendances', 'total_attendance')], by.x='perf_code', by.y='perf_code')
out_data$total_under4hrs <- out_data$total_attendance - out_data$total_over4hrs
out_data$under4hrs <- (out_data$total_under4hrs / out_data$total_attendance) * 100

out_data <- sqldf('select * from out_data order by under4hrs asc')
# without NHS Foundation Trust
out_data <- out_data[,c('perf_code',  'perf_name',  'total_attendance',  'mean_attendances',  'total_over4hrs',	'total_under4hrs',	'under4hrs')]
out_data$perf_name <-  gsub('NHS Trust', '', gsub('NHS Foundation Trust', '', out_data$perf_name))
top_list <- head(out_data,10)
bottom_list <- tail(out_data,10)
bottom_list <- sqldf('select * from bottom_list order by under4hrs asc')
# 
# # england figures
# england_attendances$type_all <- as.numeric(gsub(',', '', england_attendances$type_all))
# england_attendances$type1 <- as.numeric(gsub(',', '', england_attendances$type1))
# england_attendances$type2 <- as.numeric(gsub(',', '', england_attendances$type2))
# england_attendances$type3 <- as.numeric(gsub(',', '', england_attendances$type3))
# 
# 
# england_attendances$type_sums <- rowSums(england_attendances[,2:4])
# england_attendances$under4hrs <- england_attendances$type_all - england_attendances$type_sums
england_attendances_sums <- colSums(england_attendances)
colnames(england_attendances) <- c('total', 'type1', 'type2', 'type3', 'typeover', 'typeunder')

print(england_attendances_sums)

write.csv(top_list[,c('perf_name', 'mean_attendances', 'under4hrs')], 'list_top_10.csv')
write.csv(bottom_list[,c('perf_name', 'mean_attendances', 'under4hrs')], 'list_bottom_10.csv')
write.csv(out_data, 'ranked_list_ae_trusts_ALL_WEEKS.csv')
plot(out_data$under4hrs, out_data$mean_attendances)
